import Anthropic from '@anthropic-ai/sdk';
import type { LlmClient } from './llm.js';

/**
 * Mô hình đám mây qua Anthropic SDK (Claude). Khóa API lấy từ ANTHROPIC_API_KEY.
 * Mặc định dùng claude-opus-5-5; đổi bằng ANTHROPIC_MODEL.
 * Khi mô hình từ chối vì an toàn (stop_reason = refusal), ném lỗi để LlmBrain quay về bộ não mô phỏng.
 */
export class AnthropicClient implements LlmClient {
  readonly name = 'anthropic';
  readonly mode = 'cloud' as const;
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(options: { apiKey?: string; model?: string } = {}) {
    this.client = new Anthropic(options.apiKey ? { apiKey: options.apiKey } : {});
    this.model = options.model ?? process.env.ANTHROPIC_MODEL ?? 'claude-opus-5-5';
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  }

  async complete(system: string, prompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: prompt }],
    });
    if (response.stop_reason === 'refusal') {
      throw new Error(`Model refused the request${response.stop_details?.category ? ` (${response.stop_details.category})` : ''}`);
    }
    return response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n');
  }
}
