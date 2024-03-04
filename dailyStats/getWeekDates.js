import { DateTime } from 'luxon'

// Given an ISO Date string and a weekday integer (Luxon DateTime.weekday), returns an array of
// ISO Date strings that are in the current week.
const getWeekDates = (date, weekStartsOn) => {
  let weekDates = []

  // Step 1: Find the beginning of this week (prior to or on the current date)
  let today = DateTime.fromISO(date)
  let weekdayOfToday = today.weekday

  // Find how many days prior to today the start of this week was.
  let dayOfWeekDiff = weekdayOfToday - weekStartsOn
  if (dayOfWeekDiff < 0) {
    dayOfWeekDiff = dayOfWeekDiff + 7
  }

  let startOfThisWeek = today.minus({ days: dayOfWeekDiff })

  for (let i = 0; i <= 6; i++) {
    weekDates.push(startOfThisWeek.plus({ days: i }).toISODate())
  }

  return weekDates
}

export default getWeekDates
