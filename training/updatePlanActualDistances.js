import { DateTime } from 'luxon'
import DailyStatsModel from '../db/DailyStatsModel.js'

import addFloats from '../utils/addFloats.js'

// Given a Training Plan document, returns the correct values for: plan, week, date
const updatePlanActualDistances = async (plan) => {
  if (plan == null) {
    throw new Error('updatePlanActualDistances requires plan as a parameter')
  }

  // Grab the dailystats for the plan's date range
  const ds = await DailyStatsModel.find({
    userId: plan.userId,
    date: {
      $lt: plan.endDate,
      $gte: plan.startDate
    }
  }).exec()

  const allDailyStatsByDate = {}

  let dateISO
  ds.map((dailyStatsObj) => {
    dateISO = DateTime.fromJSDate(dailyStatsObj.date, { zone: 'utc' }).toISODate().split('T')[0]
    allDailyStatsByDate[dateISO] = dailyStatsObj
  })

  // For each week...
  //   and for each date...
  //     If there's a ds distance, save it to this date in the plan
  //     If not, set it to 0
  //   Sum these values for the week's actualDistance
  // Sum the week distances for the plan's actualDistance

  let planActualDistance = 0
  let weekStartDT
  let weekEndDT
  let weekActualDistance

  for (let week of plan.weeks) {
    weekStartDT = DateTime.fromISO(week.startDateISO, { zone: 'utc' }).startOf('day')
    weekEndDT = DateTime.fromISO(week.startDateISO, { zone: 'utc' }).plus({ days: 7 }).startOf('day')
    weekActualDistance = 0

    let thisDateDT
    let thisDS

    for (let date of plan.dates) {
      // If this date is in this week, then let's look at it now
      thisDateDT = DateTime.fromJSDate(date.dateISO, { zone: 'utc' })

      if (weekStartDT <= thisDateDT && thisDateDT < weekEndDT) {
        // Find the DS for this date and save its distance
        thisDS = allDailyStatsByDate[thisDateDT.toISODate()]
        date.actualDistance = thisDS?.distance || 0
        weekActualDistance = addFloats(thisDS?.distance || 0, weekActualDistance)
      }
    }

    week.actualDistance = weekActualDistance
    planActualDistance = addFloats(weekActualDistance, planActualDistance)
  }

  plan.actualDistance = planActualDistance

  return plan
}

export default updatePlanActualDistances
