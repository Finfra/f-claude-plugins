import { expect, test } from 'claude-code/testing'

import { clean, header, isDrawnBeneath, isHumanSession, parseFixes, prepare, resolveLogPath, rows, shouldCheck, summary } from '../hooks/lib'

test('기록 경로 — 옵션 없으면 기본값, ~ 는 HOME 으로', async () => {
  expect(resolveLogPath(undefined, '/h')).toBe('/h/.claude/spell-note/SpellingAndGrammarChecker.md')
  expect(resolveLogPath('  ', '/h')).toBe('/h/.claude/spell-note/SpellingAndGrammarChecker.md')
  expect(resolveLogPath('~/notes/spell.md', '/h')).toBe('/h/notes/spell.md')
  expect(resolveLogPath('/abs/~x.md', '/h')).toBe('/abs/~x.md')
})

test('한글 3자 미만은 검사하지 않음', async () => {
  expect(shouldCheck('git status')).toBe(false)
  expect(shouldCheck('ok 좋아')).toBe(false)
  expect(shouldCheck('이거 고쳐줘')).toBe(true)
})

test('코드 블록은 검사 입력에서 빠짐', async () => {
  expect(prepare('고쳐줘\n```\n됬다\n```')).not.toContain('됬다')
})

test('JSON 응답에서 fixes 추출, 같은 표기·빈 값은 버림', async () => {
  const reply = '결과: {"fixes":[{"from":"됬어","to":"됐어","why":"되었어 준말"},{"from":"a","to":"a","why":""},{"from":"","to":"x"}]}'
  expect(parseFixes(reply)).toEqual([{ from: '됬어', to: '됐어', why: '되었어 준말' }])
})

test('깨진 응답은 빈 배열', async () => {
  expect(parseFixes('오류 없음')).toEqual([])
  expect(parseFixes('{"fixes": 3}')).toEqual([])
  expect(parseFixes('{bad json}')).toEqual([])
})

test('표 행은 오류마다 한 줄, 파이프는 이스케이프', async () => {
  const out = rows([{ from: '할께', to: '할게', why: '어미' }, { from: 'a|b', to: 'c', why: '' }], '할께 a|b', 0)
  expect(out.trim().split('\n').length).toBe(2)
  expect(out).toContain('a\\|b')
})

test('헤더는 frontmatter 와 표 머리를 가짐', async () => {
  const h = header(0)
  expect(h.startsWith('---\nname: SpellingAndGrammarChecker\n')).toBe(true)
  expect(h).toContain('| 시각 | 틀림 | 바름 | 이유 | 원문 |')
})

test('band 요약은 3건까지, 나머지는 건수', async () => {
  const f = (n: number) => ({ from: `x${n}`, to: `y${n}`, why: '' })
  expect(summary([f(1)])).toBe('x1→y1')
  expect(summary([f(1), f(2), f(3), f(4), f(5)])).toBe('x1→y1 · x2→y2 · x3→y3 외 2건')
})

test('IDE 첨부 태그는 검사·기록 입력에서 빠짐', async () => {
  const t = '<ide_selection>The user selected 됬다</ide_selection>\n<ide_opened_file>opened x</ide_opened_file>진행 되었나 확인'
  expect(clean(t)).toBe('진행 되었나 확인')
})

test('그리는 화면이 없는 세션(claude -p)은 검사하지 않음', async () => {
  expect(isHumanSession([])).toBe(false)
  expect(isHumanSession(['vscode'])).toBe(true)
  expect(isHumanSession(['terminal'])).toBe(true)
})

const BAND = {
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 80, scroll: { offset: 0, bodyRows: 10 }, view: {} },
} as const

test('next(e) 가 엔진 자기 그림이면 비어 있음, 아래 플러그인 tree 면 양보 대상', async () => {
  expect(isDrawnBeneath({ type: 'engine', ref: 0 })).toBe(false)
  expect(isDrawnBeneath({ type: 'Text', props: {}, children: ['Heads up'] })).toBe(true)
  expect(isDrawnBeneath('Heads up')).toBe(true)
})

test('아래 플러그인(built-in you-should-know 자리)이 그린 band 는 그대로 보임', async ($, on) => {
  // 테스트의 hook 은 플러그인 아래 — 사용자 mod 아래에 앉는 built-in 자리
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>Heads up</Text>
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'spell-note', surface, ...BAND })
    expect(await ui.find({ type: 'Text', text: /Heads up/ })).toBeDefined()
    await ui.unmount()
  }
})
