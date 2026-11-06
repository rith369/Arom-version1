// Runs every security test file. Fails if any of them fails.
// npm run test:security (BACKEND-HANDOFF.md section 46)
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const FILES = ['code', 'rules', 'attacks', 'consent', 'deletion', 'limits', 'warnings', 'fixes'];
const failed = [];
for (const name of FILES) {
  console.log(`\n######## ${name}`);
  const run = spawnSync(process.execPath, [path.join(import.meta.dirname, `${name}.mjs`)], { stdio: 'inherit' });
  if (run.status !== 0) failed.push(name);
}
console.log(failed.length ? `\nSecurity tests FAILED: ${failed.join(', ')}` : '\nAll security tests passed.');
process.exit(failed.length ? 1 : 0);
