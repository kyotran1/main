import type { ApiErrorCode } from '@ads-nolimit/shared';

/**
 * Lỗi API chuẩn hóa. `code` là định danh kỹ thuật (không dịch) – giao diện dịch sang
 * tiếng Việt qua errors:codes.<code>. `message` là mô tả kỹ thuật phục vụ log.
 */
export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly statusCode: number = STATUS_BY_CODE[code],
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  not_found: 404,
  validation_failed: 400,
  conflict: 409,
  agent_paused: 409,
  approval_already_decided: 409,
  provider_unavailable: 503,
  rate_limited: 429,
  internal: 500,
};

export const notFound = (what: string, id: string) => new ApiError('not_found', `${what} "${id}" not found`);
