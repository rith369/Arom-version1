import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPrivateStorageClient } from '@/lib/supabase/private-storage';

type RouteContext = {
  params: Promise<{ messageId: string }>;
};

const noStore = { 'Cache-Control': 'private, no-store' };

/**
 * GET /api/community/messages/:messageId/media: streams a group message's
 * voice, photo or PDF. community_media_path() decides who may open it
 * (members and the mentor while it is not hidden, admins always); only then
 * does the server read the private bucket.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { messageId } = await context.params;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(messageId)) {
    return NextResponse.json({ error: 'Invalid message ID' }, { status: 400, headers: noStore });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Please sign in' }, { status: 401, headers: noStore });
  }

  const { data, error } = await supabase
    .rpc('community_media_path', { p_message_id: messageId })
    .maybeSingle<{ attachment_path: string; attachment_type: string; attachment_name: string | null }>();
  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStore });
  }

  const { data: file, error: downloadError } = await createPrivateStorageClient()
    .storage.from('community-media')
    .download(data.attachment_path);
  if (downloadError || !file) {
    return NextResponse.json({ error: 'Could not load this file' }, { status: 500, headers: noStore });
  }

  const safeName = encodeURIComponent(data.attachment_name ?? 'file');
  return new Response(file, {
    status: 200,
    headers: {
      ...noStore,
      'Content-Type': data.attachment_type || 'application/octet-stream',
      'Content-Length': String(file.size),
      'Content-Disposition': `inline; filename*=UTF-8''${safeName}`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
