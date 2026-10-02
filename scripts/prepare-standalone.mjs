// Next's standalone output omits static assets and public/; copy them in so
// `node .next/standalone/server.js` serves a complete site.
import { cpSync, existsSync } from 'node:fs';

const out = '.next/standalone';
if (!existsSync(out)) throw new Error('Missing .next/standalone; run next build first.');
cpSync('.next/static', `${out}/.next/static`, { recursive: true });
if (existsSync('public')) cpSync('public', `${out}/public`, { recursive: true });
