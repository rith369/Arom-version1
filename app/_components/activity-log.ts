// Records a finished practice or lesson for the Progress Activities tab
// (BACKEND-HANDOFF.md section 22). Fire and forget: signed out visitors get a
// 401 and nothing is saved. The server keeps one row per item per day.
export function recordActivity(kind: 'practice' | 'lesson', refId: string) {
  void fetch('/api/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, refId }),
    keepalive: true,
  }).catch(() => undefined);
}
