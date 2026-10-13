'use client';

import { usePro } from './pro-provider';
import { ScheduleEditor } from './schedule-editor';

// A new key reloads the editor when the demo switches professional.
export function ScheduleEditorPage() {
  const { demoMode } = usePro();
  return <ScheduleEditor key={demoMode} />;
}
