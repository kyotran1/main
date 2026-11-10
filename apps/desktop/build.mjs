import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

/** Đóng gói tiến trình chính + preload của Electron (CommonJS) bằng esbuild. */
await build({
  entryPoints: [resolve(here, 'src/main.ts')],
  outfile: resolve(here, 'dist/main.cjs'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  external: ['electron'],
  sourcemap: true,
  logLevel: 'info',
});
await build({
  entryPoints: [resolve(here, 'src/preload.ts')],
  outfile: resolve(here, 'dist/preload.cjs'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node20',
  external: ['electron'],
  sourcemap: true,
  logLevel: 'info',
});
