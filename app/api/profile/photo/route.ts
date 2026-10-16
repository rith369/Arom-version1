import { getProfilePhoto } from '@/lib/controllers/profile-controller';

export async function GET() {
  return getProfilePhoto();
}
