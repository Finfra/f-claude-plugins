import type { RenderElement } from 'claude-code'

import type { Fix } from '../types'

// 기록 파일 기본값 — userConfig logPath 로 바꿀 수 있음, ~ 는 $HOME 으로 치환
export const LOG_PATH = '~/.claude/spell-note/SpellingAndGrammarChecker.md'
export const LOG_NAME = 'SpellingAndGrammarChecker'

const HANGUL = /[가-힣]/g
const MAX_INPUT = 2000

export const SYSTEM = [
  '너는 한국어 맞춤법·문법 검사기다. 사용자가 AI 코딩 도구에 타이핑한 명령문이 입력으로 온다.',
  '틀린 한국어 맞춤법(ex) 됬→됐, 할께→할게, 몇일→며칠, 않되→안 되)과 명백한 문법 오류만 찾는다.',
  '무시: 띄어쓰기, 코드·경로·명령어·식별자·영어, 줄임체 어미(~함·~음), 의도적 구어·약어, 문체 취향.',
  '확신하는 것만 보고한다. 출력은 JSON 한 줄만: {"fixes":[{"from":"틀린 표기","to":"바른 표기","why":"10자 내외 이유"}]}',
  '오류가 없으면 {"fixes":[]}. JSON 외 다른 글자는 쓰지 않는다.',
].join('\n')

// next(e) 결과를 아래 플러그인이 그렸는가 — 아무도 안 그리면 엔진 자기 그림 { type: 'engine' }
export function isDrawnBeneath(tree: RenderElement | string): boolean {
  return typeof tree === 'string' || tree.type !== 'engine'
}

// 에디터가 프롬프트에 붙이는 첨부 태그(<ide_selection> 등) 제거 — 사용자가 친 글만 남김
export function clean(text: string): string {
  return text.replace(/<(ide_[a-z_]+|system-reminder)>[\s\S]*?<\/\1>/g, '').trim()
}

// 그리는 화면이 없는 세션(claude -p — 봇·스크립트 호출)은 제외.
// CLAUDE_CODE_ENTRYPOINT 는 부모 세션 값이 상속돼 판정에 못 씀(VSCode 에서 띄운 -p 도 claude-vscode)
export function isHumanSession(surfaces: readonly string[]): boolean {
  return surfaces.length > 0
}

// 기록 경로 확정 — 옵션이 비면 기본값, 앞의 ~ 만 HOME 으로
export function resolveLogPath(option: unknown, home: string): string {
  const raw = typeof option === 'string' && option.trim() !== '' ? option.trim() : LOG_PATH
  return raw.replace(/^~(?=\/|$)/, home)
}

// 검사 대상인가 — 한글이 3자 이상 있는 일반 프롬프트만
export function shouldCheck(text: string): boolean {
  return (text.match(HANGUL) ?? []).length >= 3
}

// 코드 블록 제거 후 길이 제한
export function prepare(text: string): string {
  return text.replace(/```[\s\S]*?```/g, ' ').slice(0, MAX_INPUT)
}

// 모델 응답에서 fixes 추출 — 형식이 깨지면 빈 배열
export function parseFixes(reply: string): Fix[] {
  const m = reply.match(/\{[\s\S]*\}/)
  if (!m) return []
  try {
    const raw = JSON.parse(m[0]) as { fixes?: unknown }
    if (!Array.isArray(raw.fixes)) return []
    return raw.fixes
      .filter(
        (f): f is Fix =>
          typeof f === 'object' &&
          f !== null &&
          typeof (f as Fix).from === 'string' &&
          typeof (f as Fix).to === 'string' &&
          (f as Fix).from.trim() !== '' &&
          (f as Fix).from !== (f as Fix).to,
      )
      .map(f => ({ from: f.from.trim(), to: f.to.trim(), why: typeof f.why === 'string' ? f.why.trim() : '' }))
  } catch {
    return []
  }
}

const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()

const two = (n: number) => String(n).padStart(2, '0')

export function stamp(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}.${two(d.getMonth() + 1)}.${two(d.getDate())} ${two(d.getHours())}:${two(d.getMinutes())}`
}

export function header(ms: number): string {
  return [
    '---',
    `name: ${LOG_NAME}`,
    'description: 프롬프트에서 감지한 한국어 맞춤법·문법 오류 기록 (spell-note mod 자동 append)',
    `date: ${stamp(ms).slice(0, 10)}`,
    '---',
    '',
    '# 맞춤법·문법 오류 기록',
    '',
    '| 시각 | 틀림 | 바름 | 이유 | 원문 |',
    '| :--- | :--- | :--- | :--- | :--- |',
    '',
  ].join('\n')
}

export function rows(fixes: Fix[], text: string, ms: number): string {
  const snippet = cell(text).slice(0, 60)
  return fixes
    .map(f => `| ${stamp(ms)} | ${cell(f.from)} | ${cell(f.to)} | ${cell(f.why)} | ${snippet} |`)
    .join('\n') + '\n'
}

// band 한 줄 요약 — 최대 3건
export function summary(fixes: Fix[]): string {
  const shown = fixes.slice(0, 3).map(f => `${f.from}→${f.to}`).join(' · ')
  return fixes.length > 3 ? `${shown} 외 ${fixes.length - 3}건` : shown
}
