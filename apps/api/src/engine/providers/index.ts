import type { AgentBrain } from '../brain.js';
import { MockBrain } from './mock.js';
import { LlmBrain, OllamaClient } from './llm.js';
import { AnthropicClient } from './anthropic.js';

/**
 * Chọn bộ não theo biến môi trường AI_PROVIDER (định danh kỹ thuật – không dịch):
 *   mock      – mô phỏng (mặc định, không cần mạng/khóa)
 *   ollama    – mô hình cục bộ (Local)
 *   anthropic – Claude trên đám mây (Cloud)
 * Mọi lựa chọn đều tự quay về mock khi mô hình không khả dụng → hệ thống không bao giờ dừng.
 */
export function createProvider(env: NodeJS.ProcessEnv = process.env): AgentBrain {
  const provider = (env.AI_PROVIDER ?? 'mock').toLowerCase();
  switch (provider) {
    case 'ollama':
      return new LlmBrain(new OllamaClient(env.OLLAMA_BASE_URL, env.OLLAMA_MODEL));
    case 'anthropic':
      return new LlmBrain(new AnthropicClient({ apiKey: env.ANTHROPIC_API_KEY, model: env.ANTHROPIC_MODEL }));
    default:
      return new MockBrain();
  }
}

export { MockBrain, LlmBrain, OllamaClient, AnthropicClient };
