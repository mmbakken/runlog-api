import { describe, expect, test } from '@jest/globals'
import getWeekDates from './getWeekDates.js'

describe('Date helper functions', () => {
  test('getWeekDates Monday date + Monday start of week', () => {
    const date = '2022-03-21' // Monday
    const startOfWeek = 1 // Monday
    const weekDates = getWeekDates(date, startOfWeek)

    expect(weekDates).toContainEqual('2022-03-21')
    expect(weekDates).toContainEqual('2022-03-22')
    expect(weekDates).toContainEqual('2022-03-23')
    expect(weekDates).toContainEqual('2022-03-24')
    expect(weekDates).toContainEqual('2022-03-25')
    expect(weekDates).toContainEqual('2022-03-26')
    expect(weekDates).toContainEqual('2022-03-27')
  })

  test('getWeekDates Tuesday date + Monday start of week', () => {
    const date = '2022-03-22' // Tuesday
    const startOfWeek = 1 // Monday
    const weekDates = getWeekDates(date, startOfWeek)

    expect(weekDates).toContainEqual('2022-03-21')
    expect(weekDates).toContainEqual('2022-03-22')
    expect(weekDates).toContainEqual('2022-03-23')
    expect(weekDates).toContainEqual('2022-03-24')
    expect(weekDates).toContainEqual('2022-03-25')
    expect(weekDates).toContainEqual('2022-03-26')
    expect(weekDates).toContainEqual('2022-03-27')
  })

  test('getWeekDates Monday date + Sunday start of week', () => {
    const date = '2022-03-21' // Monday
    const startOfWeek = 7 // Sunday
    const weekDates = getWeekDates(date, startOfWeek)

    expect(weekDates).toContainEqual('2022-03-20')
    expect(weekDates).toContainEqual('2022-03-21')
    expect(weekDates).toContainEqual('2022-03-22')
    expect(weekDates).toContainEqual('2022-03-23')
    expect(weekDates).toContainEqual('2022-03-24')
    expect(weekDates).toContainEqual('2022-03-25')
    expect(weekDates).toContainEqual('2022-03-26')  
  })

  test('getWeekDates Monday date + Tuesday start of week', () => {
    const date = '2022-03-21' // Monday
    const startOfWeek = 2 // Tuesday
    const weekDates = getWeekDates(date, startOfWeek)

    
    expect(weekDates).toContainEqual('2022-03-15')
    expect(weekDates).toContainEqual('2022-03-16')
    expect(weekDates).toContainEqual('2022-03-17')
    expect(weekDates).toContainEqual('2022-03-18')
    expect(weekDates).toContainEqual('2022-03-19')  
    expect(weekDates).toContainEqual('2022-03-20')
    expect(weekDates).toContainEqual('2022-03-21')
  })
})