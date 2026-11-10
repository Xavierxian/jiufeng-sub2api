export interface CacheTokenUsage {
  input_tokens: number | null | undefined
  cache_read_tokens: number | null | undefined
  cache_creation_tokens: number | null | undefined
}

/** Returns input-like tokens used as the cache hit-rate denominator. */
export function cacheInputTokenCount(row: CacheTokenUsage): number {
  return Math.max(0, row.input_tokens || 0) +
    Math.max(0, row.cache_read_tokens || 0) +
    Math.max(0, row.cache_creation_tokens || 0)
}

export function cacheHitRate(row: CacheTokenUsage): number {
  const denominator = cacheInputTokenCount(row)
  if (denominator <= 0) return 0
  return Math.min(1, Math.max(0, (row.cache_read_tokens || 0) / denominator))
}

export function formatCacheHitRate(row: CacheTokenUsage): string {
  return `${(cacheHitRate(row) * 100).toFixed(1)}%`
}
