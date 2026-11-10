import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Gói một thao tác bất đồng bộ (gọi API ghi) thành trạng thái loading / lỗi / thành công.
 * Thông điệp thành công tự ẩn sau vài giây; lỗi giữ nguyên cho tới lần chạy kế tiếp.
 */
export function useAsyncAction(successTtlMs = 4000) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const run = useCallback(
    async (action: () => Promise<unknown>, successMessage: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await action();
        setSuccess(successMessage);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setSuccess(null), successTtlMs);
        return true;
      } catch (err) {
        setError(err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [successTtlMs],
  );

  const clear = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  return { run, loading, error, success, clear };
}
