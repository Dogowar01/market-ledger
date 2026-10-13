import type { Tier } from '../types'

const HARD = [
  /\barchitect(ure)?\b/, /\bdesign\b/, /\brefactor\b/, /\bmigrat(e|ion)\b/, /\brewrite\b/,
  /\brace condition\b/, /\bdeadlock\b/, /\bconcurren/, /\bmemory leak\b/, /\bsecurity\b/,
  /\bvulnerab/, /\boptimi[sz]e\b/, /\bperformance\b/, /\bentire (codebase|repo|project)\b/,
  /\bacross (the|all|every)\b/, /\bend[- ]to[- ]end\b/, /\bfrom scratch\b/, /\bimplement\b/,
  /\bbuild (a|an|the)\b/, /\bdebug\b/, /\bwhy (does|is|doesn't|isn't)\b/, /\bplan\b/,
]

const EASY = [
  /^(what|who|when|where|which) (is|are|was|does)\b/, /\btypo\b/, /\brename\b/, /\bformat\b/,
  /\bspell/, /\btranslate\b/, /\bsummari[sz]e\b/, /\blist\b/, /\bshow me\b/, /\bexplain\b/,
  /^(hi|hello|thanks|thank you|ok|yes|no)\b/, /\bcommit\b/, /\bpush\b/, /\brun the tests\b/,
]

/** Scores a prompt's complexity and picks a model tier for it, with the reason shown in the band. */
export function classify(text: string): { tier: Tier; reason: string } {
  const t = text.toLowerCase().trim()
  const words = t.split(/\s+/).filter(Boolean).length
  const hard = HARD.filter(r => r.test(t)).length
  const easy = EASY.filter(r => r.test(t)).length
  const steps = (t.match(/^\s*(\d+[.)]|[-*])\s+/gm) ?? []).length
  const code = (t.match(/```/g) ?? []).length / 2

  let score = 0
  score += words > 150 ? 3 : words > 60 ? 2 : words > 20 ? 1 : 0
  score += hard * 2
  score -= easy * 2
  score += steps >= 3 ? 2 : 0
  score += code >= 1 ? 1 : 0

  const reason = `score ${score}: ${words} words, ${hard} hard / ${easy} easy signals`
  if (score >= 4) return { tier: 'opus', reason }
  if (score < 0 || (score === 0 && words <= 12)) return { tier: 'haiku', reason }
  return { tier: 'sonnet', reason }
}
