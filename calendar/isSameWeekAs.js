import { DateTime } from 'luxon'

// TODO: This file is not in use anywhere, but may become necessary as a filler for missing Date
// utility functions in either the API or the front end.

// Given two ISO date strings (yyyy-mm-dd) and a weekday integer marking the start of the week,
// Returns true iff both dates are in the same week. False otherwise.
const isSameWeekAs = (isoDateA, isoDateB, weekStartsOn) => {
  // Parameter validation
  if (isoDateA == null) {
    throw new Error(
      'isoDateA is required. Format as an ISO-8601 date string like "yyyy-mm-dd".'
    )
  }

  if (isoDateB == null) {
    throw new Error(
      'isoDateB is required. Format as an ISO-8601 date string like "yyyy-mm-dd".'
    )
  }

  if (
    weekStartsOn == null ||
    typeof weekStartsOn !== 'number' ||
    weekStartsOn < 1 ||
    weekStartsOn > 7
  ) {
    throw new Error(
      'weekStartsOn is required. Must be an integer between 1 and 7 (inclusively).'
    )
  }

  // Make sure the params convert to valid dates
  const dateA = DateTime.fromISO(isoDateA)
  const dateB = DateTime.fromISO(isoDateB)

  if (dateA == null) {
    throw new Error(
      'isoDateA must be formatted as an ISO-8601 date string like "yyyy-mm-dd".'
    )
  }

  if (dateB == null) {
    throw new Error(
      'isoDateA must be formatted as an ISO-8601 date string like "yyyy-mm-dd".'
    )
  }

  // Two dates can be in the same week if they're within... a week of each other
  if (dateA.diff(dateB, ['days']) > 6) {
    console.log(`Difference: ${dateA.diff(dateB, ['days'])}`)
    return false
  }

  // Starting with whichever date is later: Count backwards until you get to either the start of the week or the
  // other date.

  // Create an interval between the two dates.

  // TODO: Do I need this file? Never finished this logic, but have implemented similar logic
  // inside of other for loops for a range of dates.

  throw new Error('TODO: This function is not implemented yet - do not call.')
}

export default isSameWeekAs
