import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Mode, PromptUsage, Tier, Totals } from '../types'
import { classify } from './classify'

const MODELS: Record<Tier, string> = {
  haiku: 'claude-haiku-5-5',
  sonnet: 'claude-sonnet-5-5',
  opus: 'claude-opus-5-5',
}
const MODES: readonly Mode[] = ['auto', 'off', 'haiku', 'sonnet', 'opus']
const ZERO: Totals = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, prompts: 0 }

const last = atom({ plugin: 'token-router', key: 'last' } as const, null)
const totals = atom({ plugin: 'token-router', key: 'totals' } as const, ZERO)
const mode = atom({ plugin: 'token-router', key: 'mode' } as const, 'auto')

const k = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`)

export const register: Register = on => {
  // The tier picked for each turn, by turnId; a continuation keeps the previous pick.
  const picks = new Map<string, { tier: Tier; reason: string }>()
  let previous: { tier: Tier; reason: string } | null = null

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'route',
      description: 'Model routing: /route auto | off | haiku | sonnet | opus (no argument shows the mode)',
    })

    return next(e)
  })

  on('command.run', { command: 'route' }, async ($, e) => {
    const want = e.args.trim().toLowerCase()
    if (want === '') {
      return { text: `Routing mode: ${await read($, mode)}` }
    }
    if (!MODES.includes(want as Mode)) {
      return { text: `Unknown mode "${want}". Use one of: ${MODES.join(', ')}` }
    }
    await update($, mode, () => want as Mode)

    return { text: `Routing mode set to ${want}.` }
  })

  on('turn.start', async ($, e, next) => {
    const m = await read($, mode)
    const pick =
      m === 'auto'
        ? e.text.trim() === '' && previous ? previous : classify(e.text)
        : m === 'off'
          ? null
          : { tier: m, reason: 'pinned with /route' }
    if (pick) {
      picks.set(e.turnId, pick)
      previous = pick
    }

    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    const pick = picks.get(e.turnId)
    // Main loop only: subagents keep the model they were given.
    const routed = pick && e.agentId === undefined ? { ...e, model: MODELS[pick.tier] } : e

    return yield* next(routed)
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    const pick = picks.get(e.turnId) ?? null
    picks.delete(e.turnId)

    const u = done.usage
    if (u) {
      const row: PromptUsage = {
        input: u.input_tokens,
        output: u.output_tokens,
        cacheRead: u.cache_read_input_tokens,
        cacheWrite: u.cache_creation_input_tokens,
        model: u.model,
        tier: pick?.tier ?? null,
        reason: pick?.reason ?? 'routing off',
      }
      await update($, last, () => row)
      await update($, totals, t => ({
        input: t.input + row.input,
        output: t.output + row.output,
        cacheRead: t.cacheRead + row.cacheRead,
        cacheWrite: t.cacheWrite + row.cacheWrite,
        prompts: t.prompts + 1,
      }))
    }

    return done
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const row = await read($, last)
    if (e.props.hasSurvey || row === null) {
      return next(e)
    }
    const t = await read($, totals)
    const total = row.input + row.output + row.cacheRead + row.cacheWrite
    const sessionTotal = t.input + t.output + t.cacheRead + t.cacheWrite
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        <Text dimColor>
          Last prompt: {k(total)} tokens (in {k(row.input)} · cache read {k(row.cacheRead)} · cache write{' '}
          {k(row.cacheWrite)} · out {k(row.output)}) · session {k(sessionTotal)} over {t.prompts} prompts
        </Text>
        <Text dimColor>
          Model: {row.model}
          {row.tier ? ` · routed to ${row.tier} (${row.reason})` : ' · routing off'}
        </Text>
      </Box>
    )
  })
}
