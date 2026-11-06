// Checks on the app code itself: secrets stay on the server, no .env file is
// committed, and the security headers are still set. No database needed.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { finish } from './harness.mjs';

const ROOT = path.resolve(import.meta.dirname, '../..');
const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
const source = tracked.filter((f) => /\.(ts|tsx|js|jsx|mjs)$/.test(f) && !f.startsWith('tests/') && !f.startsWith('scripts/'));
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const results = [];
const t = (name, got, want) => results.push({ name, got, want, pass: got === want });
const list = (items) => [...new Set(items)].sort().join(', ') || 'none';

// A secret is any server variable whose name says key, secret, token or password.
const SECRET = /process\.env\.(?!NEXT_PUBLIC_)[A-Z0-9_]*(SECRET|KEY|TOKEN|PASSWORD)/;
const usesSecret = source.filter((f) => SECRET.test(read(f)));

t('files that read a secret import "server-only"',
  list(usesSecret.filter((f) => !/^import ["']server-only["'];?$/m.test(read(f)))), 'none');
t('no browser file reads a secret',
  list(usesSecret.filter((f) => /^["']use client["']/m.test(read(f)))), 'none');

const publicNames = source.flatMap((f) => read(f).match(/NEXT_PUBLIC_[A-Z0-9_]+/g) ?? []);
t('no public variable is named like a secret',
  list(publicNames.filter((n) => /SECRET|SERVICE|PRIVATE|TOKEN/.test(n))), 'none');

t('no .env file is committed', list(tracked.filter((f) => /(^|\/)\.env/.test(f) && !f.endsWith('.env.example'))), 'none');

const config = read('next.config.ts');
const headers = ['X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'Content-Security-Policy'];
t('security headers are still set in next.config.ts', list(headers.filter((h) => !config.includes(h))), 'none');

finish('code', results);
