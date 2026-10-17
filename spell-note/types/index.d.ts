export type Fix = { from: string; to: string; why: string }
export type Last = { fixes: Fix[]; at: number }

declare module 'claude-code' {
  interface PluginState {
    'spell-note': { last: Last | null; isHidden: boolean }
  }
}
