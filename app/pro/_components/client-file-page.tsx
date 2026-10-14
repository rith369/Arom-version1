'use client';

import { ClientFile } from './client-file';

// A new key reloads the file when another client is opened.
export function ClientFilePage({ clientId }: { clientId: string }) {
  return <ClientFile key={clientId} clientId={clientId} />;
}
