import { randomBytes } from 'node:crypto';

/** Sinh id ngắn có tiền tố kỹ thuật (vd: task_a1b2c3). */
export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(5).toString('hex')}`;
}

export const nowIso = (): string => new Date().toISOString();

export const minutesAgo = (m: number, from: number = Date.now()): string => new Date(from - m * 60_000).toISOString();
export const hoursAgo = (h: number, from: number = Date.now()): string => minutesAgo(h * 60, from);
export const daysFromNow = (d: number, from: number = Date.now()): string => new Date(from + d * 86_400_000).toISOString();
