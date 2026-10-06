import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
const root = fileURLToPath(new URL('..', import.meta.url));
execFileSync('npm', ['run', 'build'], { cwd: resolve(root, 'frontend'), stdio: 'inherit' });
const publicRoot = resolve(root, 'backend/public');
mkdirSync(resolve(publicRoot, 'site'), { recursive: true });
cpSync(resolve(root, 'frontend/dist'), resolve(publicRoot, 'site'), { recursive: true });
for (const asset of ['images', 'cv.pdf', 'favicon.svg', 'robots.txt', 'sitemap.xml']) {
 if (existsSync(resolve(root, 'frontend/public', asset))) cpSync(resolve(root, 'frontend/public', asset), resolve(publicRoot, asset), { recursive: true });
}
