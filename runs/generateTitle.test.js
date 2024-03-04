import { describe, expect, test } from '@jest/globals'
import generateTitle from './generateTitle.js'

describe('Run title generation', () => {
  test('Late Night run in Denver', () => {
    const tz = 'America/Denver'
    const startTime = '2022-03-29T07:00:00Z' // 1am in Denver on March 29, 2022 (-6 UTC, DST)

    const title = generateTitle(startTime, tz)
    expect(title).toBe('Late Night Run')
  })

  test('Morning run in Denver', () => {
    const tz = 'America/Denver'
    const startTime = '2022-03-29T13:00:00Z' // 7am in Denver on March 29, 2022 (-6 UTC, DST)

    const title = generateTitle(startTime, tz)
    expect(title).toBe('Morning Run')
  })

  test('Afternoon run in Denver', () => {
    const tz = 'America/Denver'
    const startTime = '2022-03-29T19:00:00Z' // 1pm in Denver on March 29, 2022 (-6 UTC, DST)

    const title = generateTitle(startTime, tz)
    expect(title).toBe('Afternoon Run')
  })

  test('Evening run in Denver', () => {
    const tz = 'America/Denver'
    const startTime = '2022-03-30T01:00:00Z' // 7pm in Denver on March 29, 2022 (-6 UTC, DST)

    const title = generateTitle(startTime, tz)
    expect(title).toBe('Evening Run')
  })
})
