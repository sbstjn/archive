import { run } from '../../../src/lambda/handler'

describe('Handler', () => {
  it('returns string value', async () => {
    await expect(run()).resolves.toBe("Done")
  })
})