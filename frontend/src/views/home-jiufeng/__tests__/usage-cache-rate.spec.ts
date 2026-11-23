import { describe, expect, it } from 'vitest'
import { cacheHitRate, cacheInputTokenCount, formatCacheHitRate } from '../components/usageCacheRate'

describe('Jiufeng usage cache hit rate', () => {
  it('uses all input-like tokens as the denominator', () => {
    const row = { input_tokens: 24950, cache_read_tokens: 56936, cache_creation_tokens: 0 }
    expect(cacheInputTokenCount(row)).toBe(81886)
    expect(cacheHitRate(row)).toBeCloseTo(56936 / 81886)
    expect(formatCacheHitRate(row)).toBe('69.5%')
  })

  it('includes cache creation tokens and clamps malformed values', () => {
    expect(formatCacheHitRate({ input_tokens: 100, cache_read_tokens: 50, cache_creation_tokens: 50 })).toBe('25.0%')
    expect(formatCacheHitRate({ input_tokens: 0, cache_read_tokens: 100, cache_creation_tokens: 0 })).toBe('100.0%')
    expect(formatCacheHitRate({ input_tokens: -1, cache_read_tokens: -1, cache_creation_tokens: -1 })).toBe('0.0%')
  })
})
