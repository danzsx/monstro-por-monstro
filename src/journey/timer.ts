export const IDLE_LIMIT_MS = 120_000;

export function activeIntervalMs(from: number, to: number, lastInteraction: number, idleLimitMs = IDLE_LIMIT_MS): number {
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return 0;
  return Math.max(0, Math.min(to, lastInteraction + idleLimitMs) - from);
}
