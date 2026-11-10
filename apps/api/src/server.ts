import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { buildApp } from './app.js';
import { OfficeStore } from './store/OfficeStore.js';
import { createSeedSnapshot } from './seed.js';
import { attachRealtime } from './realtime/socket.js';
import { OfficeEngine } from './engine/OfficeEngine.js';
import { createProvider } from './engine/providers/index.js';

/**
 * Điểm khởi động backend cục bộ (Local Runtime).
 * Biến môi trường (định danh kỹ thuật – không dịch):
 *   PORT                 cổng HTTP (mặc định 4000)
 *   HOST                 địa chỉ lắng nghe (mặc định 127.0.0.1)
 *   CORS_ORIGIN          origin cho phép (mặc định: tất cả – phù hợp chạy cục bộ)
 *   DATA_FILE            đường dẫn file trạng thái (mặc định apps/api/data/office-state.json)
 *   SEED_RESET=1         bỏ file trạng thái cũ, dựng lại dữ liệu mẫu
 *   SIMULATION=off       tắt mô phỏng tiến độ tự động của nhân sự AI
 *   AI_PROVIDER          mock | ollama | anthropic (mặc định mock)
 *   WEB_DIST             thư mục bản build Web để phục vụ cùng origin (mặc định apps/web/dist nếu tồn tại; đặt "off" để tắt)
 */
const here = dirname(fileURLToPath(import.meta.url));

// Nạp apps/api/.env (nếu có) trước khi đọc cấu hình – biến đã có trong shell được ưu tiên.
const envFile = process.env.ENV_FILE ?? resolve(here, '..', '.env');
if (existsSync(envFile)) {
  try {
    process.loadEnvFile(envFile);
  } catch (err) {
    console.warn(`[api] Không nạp được tệp môi trường ${envFile}:`, err);
  }
}
const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '127.0.0.1';
const dataFile = process.env.DATA_FILE ?? resolve(here, '..', 'data', 'office-state.json');
const reset = process.env.SEED_RESET === '1';
const webDist = process.env.WEB_DIST === 'off' ? undefined : (process.env.WEB_DIST ?? resolve(here, '..', '..', 'web', 'dist'));

const store = OfficeStore.loadOrSeed(createSeedSnapshot, dataFile, reset);
const engine = new OfficeEngine(store, {
  provider: createProvider(process.env),
  simulation: process.env.SIMULATION !== 'off',
});

const app = await buildApp({ store, engine, corsOrigin: process.env.CORS_ORIGIN ?? true, logger: true, webDist });
const realtime = attachRealtime(app.server, store, process.env.CORS_ORIGIN ?? true);

engine.start();

const shutdown = async () => {
  engine.stop();
  await realtime.close();
  await app.close();
  store.persistNow();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await app.listen({ port, host });
app.log.info(`ADS-NOLIMIT AI OFFICE – local runtime listening on http://${host}:${port}`);
