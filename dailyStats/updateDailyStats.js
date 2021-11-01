import { DateTime } from 'luxon'
import DailyStatsModel from '../db/DailyStatsModel.js'

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
const updateDailyStats = async (newRun, user) => {
  // Timeone field has a weird format like "(GMT-07:00) America/Denver", just ignore the offset
  const tz = newRun.timezone.split(' ')[1]
  const date = DateTime.fromJSDate(newRun.startDate, { zone: tz })

  let currentDailyStats = await DailyStatsModel.find({ date: date.toISODate() })

  // None exists => Make a new DailyStats document for today's run date
  if (currentDailyStats == null) {
    currentDailyStats = new DailyStatsModel({
      userId: user._id,
      date: date.toISODate(),
      runIds: [newRun._id],
      title: newRun.title,
      distance: newRun.distance,
      sevenDayDistance: newRun.distance,
      weeklyDistance: newRun.distance,
    })
  }

  // Step 1: Update this date's sevenDayDistance and weeklyDistance fields.
  // - sevenDayDistance: All prior dates within 7 days should be added to today's distance.
  // - weeklyDistance: All prior dates in the current week should be added to today's distance.

  // Find the DailyStats for the prior 6 days (if any exist)
  const recentDailyStats = await DailyStatsModel.find({
    date: {
      $lt: date.toISODate(),
      $gte: date.minus({ days: 6 }).toISODate()
    }
  }).sort('date', -1)

  let recentDatesMap = {}

  if (recentDailyStats && recentDailyStats.length) {
    // Convert the DailyStats array into a map so we can easily look them up by ISO date string
    for (let i = 0; i < recentDailyStats.length; i++) {
      let thisDS = recentDatesMap[i]
      recentDatesMap[thisDS.date.toISODate()] = thisDS
    }

    let foundStartOfWeek = date.weekday === user.stats.weekStartsOn

    // For each of the prior 6 dates, update the sevenDay and weekly totals as necessary
    for (let i = 1; i <= 6; i++) {
      let compareDate = date.minus({ days: i })
      let compareDailyStats = recentDatesMap[compareDate.toISODate()]

      // A DailyStats document may not exist for this date
      if (compareDailyStats) {
        // sevenDayDistance: Sum the distance from the prior 6 dates
        currentDailyStats.sevenDayDistance += compareDailyStats.distance

        // If it does, add its distance to the weekly total for the new run's DailyStats
        if (!foundStartOfWeek) {
          currentDailyStats.weeklyDistance += compareDailyStats.distance

          // Have we hit the start of the week for this run?
          // If so, next loop we'll stop adding to the week's totals
          foundStartOfWeek = compareDate.weekday === user.stats.weekStartsOn
        }
      } else {
        // Even if the dailyStats object doesn't exist, we should see if this date is the first
        // one of the week.
        foundStartOfWeek = compareDate.weekday === user.stats.weekStartsOn
      }
    }
  }

  // The run date's DailyStats document is up to date
  await currentDailyStats.save()

  // Step 2: Update future DailyStats sevenDayDistance and weeklyDistance fields.
  // Only need to update the next 6 dates' DailyStats at most.

  // Get the next seven date's DailyStats documents
  const upcomingDailyStats = await DailyStatsModel.find({
    date: {
      $gt: date.toISODate(),
      $lte: date.plus({ days: 6 }).toISODate()
    }
  }).sort('date', 1)

  let upcomingDatesMap = {}

  if (upcomingDailyStats && upcomingDailyStats.length) {
    // Convert the DailyStats array into a map so we can easily look them up by ISO date string
    for (let i = 0; i < upcomingDailyStats.length; i++) {
      let thisDS = upcomingDatesMap[i]
      upcomingDatesMap[thisDS.date.toISODate()] = thisDS
    }

    // For each of the next 6 dates, update the sevenDay and weekly totals as necessary
    let foundEndOfWeek
    for (let i = 1; i <= 6; i++) {
      let compareDate = date.plus({ days: i })
      let compareDailyStats = recentDatesMap[compareDate.toISODate()]

      // A DailyStats document may not exist for this date
      if (compareDailyStats) {
        // sevenDayDistance: Always add today's distance
        compareDailyStats.sevenDayDistance += currentDailyStats.distance

        // Have we hit the start of the week for this run? If so, don't add to the weekly total
        foundEndOfWeek = compareDate.weekday === user.stats.weekStartsOn
        if (!foundEndOfWeek) {
          compareDailyStats.weeklyDistance += currentDailyStats.distance
        }
      } else {
        // Even if the dailyStats object doesn't exist, we should see if this date is the first
        // one of the week.
        foundEndOfWeek = compareDate.weekday === user.stats.weekStartsOn
      }
    }
  }

  // Done updating the upcoming DailyStats documents
  await currentDailyStats.save()
}

export default updateDailyStats
