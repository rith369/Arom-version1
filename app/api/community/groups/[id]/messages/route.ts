import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPrivateStorageClient } from '@/lib/supabase/private-storage';
import { MAX_FILE_BYTES, MAX_VOICE_BYTES, MAX_VOICE_SECONDS } from '@/lib/messages';
import { attachmentName, attachmentType, voiceType } from '@/lib/controllers/messages-controller';

const MEDIA_BUCKET = 'community-media';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const noStore = { 'Cache-Control': 'private, no-store' };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    return NextResponse.json(
      { error: 'Invalid group ID' },
      { status: 400, headers: noStore },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Please sign in' },
      { status: 401, headers: noStore },
    );
  }

  const { data, error } = await supabase.rpc('read_community_messages', {
    p_group_id: id,
  });

  if (error) {
    console.error('Could not read community messages:', error);
    return NextResponse.json(
      { error: 'Could not read messages for this group' },
      { status: error.code === 'P0001' ? 403 : 500, headers: noStore },
    );
  }

  return NextResponse.json({ messages: data ?? [] }, { headers: noStore });
}
export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    return NextResponse.json(
      { error: 'Invalid group ID' },
      { status: 400, headers: noStore },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Please sign in' },
      { status: 401, headers: noStore },
    );
  }

  // A voice message, photo or PDF comes as a form with a file.
  if (request.headers.get('content-type')?.startsWith('multipart/form-data')) {
    return sendMedia(request, supabase, id, user.id);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400, headers: noStore },
    );
  }

  const content =
    body && typeof body === 'object' && 'content' in body ? body.content : null;

  if (
    typeof content !== 'string' ||
    !content.trim() ||
    content.trim().length > 2000
  ) {
    return NextResponse.json(
      { error: 'Message must be between 1 and 2000 characters' },
      { status: 400, headers: noStore },
    );
  }

  const { data, error } = await supabase
    .from('community_messages')
    .insert({
      group_id: id,
      author_id: user.id,
      content: content.trim(),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Could not send community message:', error);
    return NextResponse.json(
      { error: 'Could not send message' },
      { status: error.code === '42501' ? 403 : 500, headers: noStore },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201, headers: noStore });
}

/**
 * Uploads the file into the sender's folder in this group, then saves the
 * message. Storage and RLS both check that the sender is a member or the
 * mentor of an active group. The type is checked from the file's first bytes.
 */
async function sendMedia(
  request: Request,
  supabase: Awaited<ReturnType<typeof createClient>>,
  groupId: string,
  userId: string,
) {
  const bad = (error: string) => NextResponse.json({ error }, { status: 400, headers: noStore });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return bad('Invalid request body');
  }

  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) return bad('Choose a file to send.');
  const bytes = new Uint8Array(await file.arrayBuffer());

  let row: {
    kind: 'voice' | 'image' | 'file';
    extension: string;
    contentType: string;
    name: string | null;
    duration: number | null;
  };

  if (form.get('kind') === 'voice') {
    const seconds = Number(form.get('durationSeconds'));
    const audio = voiceType(bytes);
    if (!audio || bytes.byteLength > MAX_VOICE_BYTES) return bad('The voice message could not be read.');
    if (!Number.isInteger(seconds) || seconds < 1 || seconds > MAX_VOICE_SECONDS) {
      return bad('A voice message is 1 to 120 seconds.');
    }
    row = { kind: 'voice', extension: audio.extension, contentType: audio.contentType, name: null, duration: seconds };
  } else {
    const detected = attachmentType(bytes);
    if (!detected || bytes.byteLength > MAX_FILE_BYTES) {
      return bad('Send a photo (JPG, PNG or WebP) or a PDF file, up to 5 MB.');
    }
    row = {
      kind: detected.kind,
      extension: detected.extension,
      contentType: detected.contentType,
      name: attachmentName(file.name, detected.extension),
      duration: null,
    };
  }

  const path = `${groupId}/${userId}/${crypto.randomUUID()}.${row.extension}`;
  const upload = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, bytes, { contentType: row.contentType, upsert: false });
  if (upload.error) {
    return NextResponse.json(
      { error: 'Your file could not be uploaded. Are you still in this group?' },
      { status: 403, headers: noStore },
    );
  }

  const { data, error } = await supabase
    .from('community_messages')
    .insert({
      group_id: groupId,
      author_id: userId,
      content: '',
      kind: row.kind,
      attachment_path: path,
      attachment_name: row.name,
      attachment_type: row.contentType,
      attachment_size: bytes.byteLength,
      duration_seconds: row.duration,
    })
    .select('id')
    .single();

  if (error) {
    // An upload that never became a message is removed again.
    await createPrivateStorageClient().storage.from(MEDIA_BUCKET).remove([path]);
    console.error('Could not send community media:', { code: error.code, message: error.message });
    return NextResponse.json(
      { error: 'Could not send message' },
      { status: error.code === '42501' ? 403 : 500, headers: noStore },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201, headers: noStore });
}
