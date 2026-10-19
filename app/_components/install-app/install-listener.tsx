'use client';

import { useEffect } from 'react';
import { listenForInstallPrompt } from './install-store';

// Mounted once in the root layout so the install event is caught on whatever
// page the user lands on, not only when they open Settings.
export function InstallListener() {
  useEffect(() => {
    listenForInstallPrompt();
  }, []);
  return null;
}
