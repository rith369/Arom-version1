'use client';

import { usePro } from './pro-provider';
import { ProfileEditor } from './profile-editor';

// A new key reloads the editor when the demo switches professional.
export function ProfileEditorPage() {
  const { demoMode } = usePro();
  return <ProfileEditor key={demoMode} />;
}
