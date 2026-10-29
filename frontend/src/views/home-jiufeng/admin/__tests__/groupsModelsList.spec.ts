import {
  addCustomModelsListItem,
  buildModelsListConfig,
  createModelsListState,
  setModelsListCandidates,
} from '../groupsModelsList'

describe('Jiufeng group model allowlist', () => {
  it('adds exact and arbitrary-position wildcard entries as selected items', () => {
    const state = createModelsListState()

    expect(addCustomModelsListItem(state, ' gpt-5.5-codex ')).toBeNull()
    expect(addCustomModelsListItem(state, 'claude-*')).toBeNull()
    expect(addCustomModelsListItem(state, 'gpt-*-codex')).toBeNull()
    expect(addCustomModelsListItem(state, '*-preview')).toBeNull()
    expect(addCustomModelsListItem(state, '*-sonnet-*')).toBeNull()
    expect(buildModelsListConfig(state)).toEqual({
      enabled: false,
      models: ['gpt-5.5-codex', 'claude-*', 'gpt-*-codex', '*-preview', '*-sonnet-*'],
    })
  })

  it('rejects empty and case-insensitive duplicate entries, including wildcards', () => {
    const state = createModelsListState()
    setModelsListCandidates(state, ['Claude-Sonnet-4'])

    expect(addCustomModelsListItem(state, '   ')).toBe('empty')
    expect(addCustomModelsListItem(state, 'claude-sonnet-4')).toBe('duplicate')
    expect(addCustomModelsListItem(state, 'claude-*-latest')).toBeNull()
    expect(addCustomModelsListItem(state, 'CLAUDE-*-LATEST')).toBe('duplicate')
  })
})
