import {
  addCustomModelsListItem,
  buildModelsListConfig,
  createModelsListState,
  setModelsListCandidates,
} from '../groupsModelsList'

describe('Jiufeng group model allowlist', () => {
  it('adds exact and trailing-wildcard entries as selected items', () => {
    const state = createModelsListState()

    expect(addCustomModelsListItem(state, ' gpt-5.5-codex ')).toBeNull()
    expect(addCustomModelsListItem(state, 'claude-*')).toBeNull()
    expect(buildModelsListConfig(state)).toEqual({
      enabled: false,
      models: ['gpt-5.5-codex', 'claude-*'],
    })
  })

  it('rejects empty, embedded-wildcard, and case-insensitive duplicate entries', () => {
    const state = createModelsListState()
    setModelsListCandidates(state, ['Claude-Sonnet-4'])

    expect(addCustomModelsListItem(state, '   ')).toBe('empty')
    expect(addCustomModelsListItem(state, 'claude-*-latest')).toBe('invalidWildcard')
    expect(addCustomModelsListItem(state, 'claude-sonnet-4')).toBe('duplicate')
  })
})
