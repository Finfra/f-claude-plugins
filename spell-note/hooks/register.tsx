import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Last } from '../types'
import { SYSTEM, clean, header, isDrawnBeneath, isHumanSession, parseFixes, prepare, resolveLogPath, rows, shouldCheck, summary } from './lib'

const last = atom({ plugin: 'spell-note', key: 'last' } as const, null)
const isHidden = atom({ plugin: 'spell-note', key: 'isHidden' } as const, false)

// 사람이 직접 친 프롬프트만 — 알림·peer·자동 이어쓰기 제외
const HUMAN = new Set(['composer', 'bridge', 'sdk', 'unclassified'])

// 파일 append 직렬화 — 연속 프롬프트의 read→write 경합 방지
let chain: Promise<void> = Promise.resolve()

function record($: EngineInterface, logPath: unknown, body: string, ms: number): Promise<void> {
  chain = chain
    .then(async () => {
      const home = (await $.env.get('HOME')) ?? ''
      const path = resolveLogPath(logPath, home)
      const prev = (await $.fs.exists(path)) ? await $.fs.read(path) : header(ms)
      await $.fs.write(path, prev.endsWith('\n') ? prev + body : `${prev}\n${body}`)
    })
    .catch(err => $.ui.log(`spell-note: 기록 실패 ${String(err)}`))
  return chain
}

async function check($: EngineInterface, logPath: unknown, text: string): Promise<void> {
  const r = await $.model.complete({
    model: 'haiku',
    system: SYSTEM,
    prompt: prepare(text),
    maxTokens: 600,
    effort: 'low',
    timeoutMs: 30_000,
  })
  if (!r.isAnswered) return

  const fixes = parseFixes(r.text)
  const ms = await $.clock.now()
  const cur: Last | null = fixes.length > 0 ? { fixes, at: ms } : null
  await update($, last, () => cur)
  await update($, isHidden, () => false)
  if (fixes.length > 0) await record($, logPath, rows(fixes, text, ms), ms)
}

export const register: Register = (on, options) => {
  on('prompt.submit', async ($, e, next) => {
    const result = await next(e)
    const isHuman = HUMAN.has(e.origin.kind) && !e.isMeta && !e.command
    const text = clean(e.text)
    if (isHuman && shouldCheck(text) && isHumanSession(await $.session.surfaces())) {
      // 턴을 막지 않도록 기다리지 않음
      void check($, options.logPath, text).catch(err => $.ui.log(`spell-note: 검사 실패 ${String(err)}`))
    }
    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // 사용자 mod 는 built-in 플러그인보다 바깥 — 먼저 그리면 you-should-know 제안을 가린다.
    // 아래에서 그린 것이 있으면 양보하고, band 가 비었을 때만 맞춤법을 보인다
    const beneath = await next(e)
    if (isDrawnBeneath(beneath)) return beneath

    const cur = await read($, last)
    if (e.props.hasSurvey || cur === null || (await read($, isHidden))) {
      return beneath
    }

    const { Box, Button, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text dimColor>✎ 맞춤법 {cur.fixes.length}건: {summary(cur.fixes)} </Text>
        <Button key="hide" label="닫기" onPress={() => update($, isHidden, () => true)} />
      </Box>
    )
  })
}
