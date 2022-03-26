import { DateTime } from 'luxon'
import DailyStatsModel from '../db/DailyStatsModel.js'
import getWeekDates from './getWeekDates.js'

// TODO: Test cases to implement:
// 1. Add a run that is later than every existing run
//   - This will be the most common scenario (new run happens today, is synced right after)
// 2. Add a run that is later than some runs in a week, but not the latest.
//   - E.g. Multiple runs added back to back, but later run is added before an earlier one in the same week
// 3. Add a run that has no other runs in the same week or within seven days
//   - E.g. The user takes a break from running for a while. Only this DS document should be affected.
// 4. Add a run that occurs before and after existing runs
//   - E.g. Something went wrong and we went to resync Strava runs, and now we're adding a run far in the past
//
// Test framework:
// - Generate a set of DailyStats and Run documents to populate a test database
// - Attempt to add another run via stravaWebhookHandler.js
// - This function gets called for a new run
// - Validate that the database has exactly the new contents we anticipate, given the new run's date
//   and the Runs/DailyStats we populated the test database with.

// Either create a new DailyStats document for this date, or look up the existing DailyStats
// document for this date and add distances and this runId to the document.
//
// Also updates the existing DailyStats documents with new mileage totals, if applicable (recent
// dates or nearby future dates, if this run is older than other runs).
const updateDailyStats = async (newRun, user) => {
  // Timeone field has a weird format like "(GMT-07:00) America/Denver", just ignore the offset
  const tz = newRun.timezone.split(' ')[1]
  const runStartDate = DateTime.fromJSDate(newRun.startDate, { zone: tz })
  const currentWeekDates = getWeekDates(runStartDate.toISODate(), user.stats.weekStartsOn)

  let currentDailyStats = await DailyStatsModel.findOne({ date: runStartDate.toISODate(), userId: user._id })

  // None exists => Make a new DailyStats document for today's run date
  if (currentDailyStats == null) {
    currentDailyStats = new DailyStatsModel({
      userId: user._id,
      date: runStartDate.toISODate(),
      runIds: [newRun._id],
      title: newRun.title,
      distance: newRun.distance,
      sevenDayDistance: newRun.distance,
      weeklyDistance: newRun.distance,
    })
  }

  // Step 1: Update this date's DailyStats' sevenDayDistance and weeklyDistance fields.
  // - sevenDayDistance: All prior dates within 7 days should be added to today's distance.
  // - weeklyDistance: All prior dates in the current week should be added to today's distance.

  // Find the DailyStats for the prior 6 days (if any exist)
  const recentDailyStats = await DailyStatsModel.find({
    date: {
      $lt: runStartDate.toISODate(),
      $gte: runStartDate.minus({ days: 6 }).toISODate()
    }
  }).sort({date: -1})

  let recentDatesMap = {}

  if (recentDailyStats && recentDailyStats.length) {
    // Convert the DailyStats array into a map so we can easily look them up by ISO date string
    for (let i = 0; i < recentDailyStats.length; i++) {
      let thisDS = recentDailyStats[i]
      recentDatesMap[DateTime.fromJSDate(thisDS.date, { zone: 'utc' }).toISODate()] = thisDS
    }

    // For each of the prior 6 dates, update the sevenDay and weekly totals as necessary
    for (let i = 1; i <= 6; i++) {
      let compareDate = runStartDate.minus({ days: i })
      let compareDailyStats = recentDatesMap[compareDate.toISODate()]

      // A DailyStats document may not exist for this date
      if (compareDailyStats) {
        // sevenDayDistance: Sum the distance from the prior 6 dates
        currentDailyStats.sevenDayDistance += compareDailyStats.distance

        if (currentWeekDates.includes(compareDate.toISODate())) {
          currentDailyStats.weeklyDistance += compareDailyStats.distance
        }
      }
    }
  }

  // The run date's DailyStats document is up to date
  await currentDailyStats.save()

  // TODO: The below code is untested and likely buggy. Do not rely on it!

  // Step 2: Update future DailyStats sevenDayDistance and weeklyDistance fields.
  // Only need to update the next 6 dates' DailyStats at most.

  // Get the next seven date's DailyStats documents
  const upcomingDailyStats = await DailyStatsModel.find({
    date: {
      $gt: runStartDate.toISODate(),
      $lte: runStartDate.plus({ days: 6 }).toISODate()
    }
  }).sort({date: 1})

  let upcomingDatesMap = {}

  if (upcomingDailyStats && upcomingDailyStats.length) {
    // Convert the DailyStats array into a map so we can easily look them up by ISO date string
    for (let i = 0; i < upcomingDailyStats.length; i++) {
      let thisDS = upcomingDailyStats[i]
      upcomingDatesMap[DateTime.fromJSDate(thisDS.date, { zone: 'utc' }).toISODate()] = thisDS
    }

    // For each of the next 6 dates, update the sevenDay and weekly totals as necessary
    for (let i = 1; i <= 6; i++) {
      let compareDate = runStartDate.plus({ days: i })
      let compareDailyStats = upcomingDatesMap[compareDate.toISODate()]

      // A DailyStats document may not exist for this date
      if (compareDailyStats) {
        // sevenDayDistance: Always add today's distance
        compareDailyStats.sevenDayDistance += currentDailyStats.distance

        if (currentWeekDates.includes(compareDate.toISODate())) {
          compareDailyStats.weeklyDistance += currentDailyStats.distance
        }

        await compareDailyStats.save()
      }
    }
  }
}

export default updateDailyStats
