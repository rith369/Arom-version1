'use client';

import { ClientFile } from './client-file';
import { usePro } from './pro-provider';

// A new key reloads the file when the demo switches professional.
export function ClientFilePage({ clientId }: { clientId: string }) {
  const { demoMode } = usePro();
  return <ClientFile key={`${demoMode}-${clientId}`} clientId={clientId} />;
}
