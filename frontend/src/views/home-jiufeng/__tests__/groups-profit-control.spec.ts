import { describe, expect, it } from 'vitest'

import {
  isProfitControlPlatform,
  profitDecimalToPercent,
  profitPercentToDecimal,
  validateProfitControlFormState,
  type ProfitControlFormState,
} from '../admin/groupsProfitControl'

const formState = (
  overrides: Partial<ProfitControlFormState> = {},
): ProfitControlFormState => ({
  platform: 'openai',
  profit_control_enabled: true,
  profit_min_margin_percent: 30,
  profit_safety_buffer_percent: 5,
  ...overrides,
})

describe('Jiufeng group profit control', () => {
  it('supports the five token platforms only', () => {
    for (const platform of ['openai', 'anthropic', 'gemini', 'grok', 'antigravity']) {
      expect(isProfitControlPlatform(platform)).toBe(true)
    }
    expect(isProfitControlPlatform('composite')).toBe(false)
  })

  it('converts percentages using backend decimal precision', () => {
    expect(profitPercentToDecimal(33.33)).toBe(0.3333)
    expect(profitPercentToDecimal(99.999)).toBe(1)
    expect(profitDecimalToPercent(0.3333)).toBe(33.33)
    expect(profitDecimalToPercent(null)).toBe(0)
  })

  it('validates ranges and the combined admission threshold', () => {
    expect(validateProfitControlFormState(formState())).toBeNull()
    expect(validateProfitControlFormState(formState({ profit_min_margin_percent: -1 }))).toBe('marginRangeError')
    expect(validateProfitControlFormState(formState({ profit_safety_buffer_percent: 100 }))).toBe('bufferRangeError')
    expect(validateProfitControlFormState(formState({
      profit_min_margin_percent: 60,
      profit_safety_buffer_percent: 40,
    }))).toBe('sumTooHigh')
  })

  it('skips validation when disabled or unsupported', () => {
    expect(validateProfitControlFormState(formState({
      profit_control_enabled: false,
      profit_min_margin_percent: 200,
    }))).toBeNull()
    expect(validateProfitControlFormState(formState({
      platform: 'composite',
      profit_min_margin_percent: 200,
    }))).toBeNull()
  })
})
