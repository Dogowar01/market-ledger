import { expect, test } from 'claude-code/testing'

const run = (args: string) =>
  ({ command: 'route', args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 80 } }) as const

import { classify } from '../hooks/classify'

test('short questions route to haiku', () => {
  expect(classify('what is a closure?').tier).toBe('haiku')
  expect(classify('fix the typo in the README').tier).toBe('haiku')
})

test('ordinary coding asks route to sonnet', () => {
  expect(classify('add a --verbose flag to the CLI that prints each request URL before it is sent').tier).toBe('sonnet')
})

test('large or hard tasks route to opus', () => {
  expect(classify('refactor the auth module and migrate the session store to redis, then debug the race condition in the token refresh').tier).toBe('opus')
  expect(classify('Plan this:\n1. design the schema\n2. implement the API\n3. write tests').tier).toBe('opus')
})

test('/route sets and reports the mode', async $ => {
  expect((await $.command.run(run('opus'))).text).toContain('opus')
  expect((await $.command.run(run(''))).text).toBe('Routing mode: opus')
  expect((await $.command.run(run('gpt'))).text).toContain('Unknown mode')
})
