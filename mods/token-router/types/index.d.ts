export type Tier = 'haiku' | 'sonnet' | 'opus'

export type Mode = 'auto' | 'off' | Tier

export type PromptUsage = {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
  model: string
  tier: Tier | null
  reason: string
}

export type Totals = { input: number; output: number; cacheRead: number; cacheWrite: number; prompts: number }

declare module 'claude-code' {
  interface PluginState {
    'token-router': {
      last: PromptUsage | null
      totals: Totals
      mode: Mode
    }
  }
}
