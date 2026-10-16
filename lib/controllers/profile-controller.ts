import { Buffer } from 'node:buffer';
import type { NextRequest } from 'next/server';
import { profileUpdateSchema, type ProfileResponse } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  PROFILE_COLUMNS,
  buildAuthUser,
  fail,
  invalidInput,
  json,
  readJson,
  toAuthUser,
  unauthorized,
  NO_STORE,
  type ProfileRow,
} from './shared';

const PROFILE_PHOTO_BUCKET = 'user-profile-photos';
const MAX_PROFILE_PHOTO_BYTES = 5 * 1024 * 1024;
const PROFILE_PHOTO_TYPES: Record<
  string,
  { extension: string; matches: (bytes: Uint8Array) => boolean }
> = {
  'image/jpeg': {
    extension: 'jpg',
    matches: (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  'image/png': {
    extension: 'png',
    matches: (bytes) =>
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47,
  },
  'image/webp': {
    extension: 'webp',
    matches: (bytes) =>
      Buffer.from(bytes.slice(0, 4)).toString('ascii') === 'RIFF' &&
      Buffer.from(bytes.slice(8, 12)).toString('ascii') === 'WEBP',
  },
};

/*
 * AROM profile controller. Every query runs as the signed in user, so RLS
 * keeps it to their own row. Role is never accepted from the client.
 */

/** GET /api/profile */
export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return unauthorized();
  return json<ProfileResponse>({ user: await toAuthUser(supabase, user) });
}

/** PATCH /api/profile. Updates the signed in user's private profile fields. */
export async function updateProfile(request: NextRequest) {
  let input: unknown;
  let photo: File | null = null;

  if (request.headers.get('content-type')?.includes('multipart/form-data')) {
    try {
      const form = await request.formData();
      input = {
        fullName: form.get('fullName') ?? undefined,
        pronouns: form.get('pronouns') ?? undefined,
        aboutMe: form.get('aboutMe') ?? undefined,
      };
      const photoValue = form.get('photo');
      if (photoValue instanceof File) photo = photoValue;
      else if (photoValue !== null) return invalidInput();
    } catch {
      return invalidInput();
    }
  } else {
    input = await readJson(request);
  }

  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) return invalidInput();
  if (Object.keys(parsed.data).length === 0 && !photo) return invalidInput();

  let photoBytes: Uint8Array | null = null;
  let photoExtension: string | null = null;
  let photoContentType: string | null = null;
  if (photo) {
    if (photo.size === 0 || photo.size > MAX_PROFILE_PHOTO_BYTES) return invalidInput();
    const photoType = PROFILE_PHOTO_TYPES[photo.type];
    photoBytes = new Uint8Array(await photo.arrayBuffer());
    if (!photoType || !photoType.matches(photoBytes)) return invalidInput();
    photoExtension = photoType.extension;
    photoContentType = photo.type;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return unauthorized();

  const { fullName, language, hideIdentity, pronouns, aboutMe } = parsed.data;

  if (hideIdentity !== undefined) {
    const currentUser = await toAuthUser(supabase, user);
    if (currentUser.role !== 'user') {
      return fail('forbidden', 'This setting is only available to users.', 403);
    }
  }
  const changes: {
    full_name?: string;
    pronouns?: string | null;
    about_me?: string | null;
    avatar_path?: string | null;
    language?: 'en' | 'km';
    hide_identity?: boolean;
  } = {};

  if (fullName !== undefined) changes.full_name = fullName;
  if (pronouns !== undefined) changes.pronouns = pronouns || null;
  if (aboutMe !== undefined) changes.about_me = aboutMe || null;
  if (language !== undefined) changes.language = language;
  if (hideIdentity !== undefined) changes.hide_identity = hideIdentity;

  const { data: currentProfile, error: currentProfileError } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', user.id)
    .maybeSingle<{ avatar_path: string | null }>();

  if (currentProfileError) {
    return fail(
      'server_error',
      'We could not save your changes. Please try again.',
      500,
    );
  }

  let uploadedPhotoPath: string | null = null;
  if (photoBytes && photoExtension) {
    uploadedPhotoPath = `${user.id}/${crypto.randomUUID()}.${photoExtension}`;
    const { error: uploadError } = await supabase.storage
      .from(PROFILE_PHOTO_BUCKET)
      .upload(uploadedPhotoPath, photoBytes, {
        contentType: photoContentType ?? 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      return fail('server_error', 'We could not upload your photo. Please try again.', 500);
    }
    changes.avatar_path = uploadedPhotoPath;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(changes)
    .eq('id', user.id)
    .select(PROFILE_COLUMNS)
    .maybeSingle<ProfileRow>();

  if (error || !profile) {
    if (uploadedPhotoPath) {
      await supabase.storage.from(PROFILE_PHOTO_BUCKET).remove([uploadedPhotoPath]);
    }
    return fail(
      'server_error',
      'We could not save your changes. Please try again.',
      500,
    );
  }

  // Keep auth metadata in step so emails and fallbacks use the new name.
  if (fullName !== undefined) {
    await supabase.auth.updateUser({ data: { full_name: fullName } });
  }

  if (uploadedPhotoPath && currentProfile?.avatar_path) {
    await supabase.storage
      .from(PROFILE_PHOTO_BUCKET)
      .remove([currentProfile.avatar_path]);
  }

  return json<ProfileResponse>({ user: buildAuthUser(user, profile) });
}

/** GET /api/profile/photo. Streams only the signed in user's private photo. */
export async function getProfilePhoto() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return unauthorized();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', user.id)
    .maybeSingle<{ avatar_path: string | null }>();

  if (profileError || !profile?.avatar_path) {
    return new Response(null, { status: 404, headers: NO_STORE });
  }

  const { data: photo, error: photoError } = await supabase.storage
    .from(PROFILE_PHOTO_BUCKET)
    .download(profile.avatar_path);

  if (photoError || !photo) {
    return new Response(null, { status: 404, headers: NO_STORE });
  }

  return new Response(photo, {
    headers: {
      ...NO_STORE,
      'Content-Type': photo.type || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
