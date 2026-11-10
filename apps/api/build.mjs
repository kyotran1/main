import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Đóng gói backend thành một tệp ESM chạy được bằng `node dist/server.js`.
 * Các gói workspace (@ads-nolimit/*) được gộp vào vì chúng phân phối ở dạng mã nguồn TS;
 * mọi phụ thuộc trong node_modules giữ nguyên (external) để không làm phình tệp.
 */
const externalizeNodeModules = {
  name: 'externalize-node-modules',
  setup(b) {
    b.onResolve({ filter: /^[^./]/ }, (args) => {
      if (args.path.startsWith('@ads-nolimit/')) return null;
      return { path: args.path, external: true };
    });
  },
};

await build({
  entryPoints: [resolve(here, 'src/server.ts')],
  outfile: resolve(here, 'dist/server.js'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  sourcemap: true,
  plugins: [externalizeNodeModules],
  logLevel: 'info',
});
