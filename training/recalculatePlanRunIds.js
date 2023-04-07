import { DateTime } from 'luxon'
import DailyStatsModel from '../db/DailyStatsModel.js'

// Given a plan object, return an updated plan with plan.dates objects that reflect the correct
// runIds array values.
const recalculatePlanRunIds = async (plan) => {
  if (plan == null) {
    console.error('Cannot update training plan.dates runIds fields: plan is required.')
    return
  }

  if (plan.dates == null) {
    console.error('Cannot update training plan.dates runIds fields: plan.dates is required.')
    return
  }

  if (plan.userId == null) {
    console.error('Cannot update training plan.dates runIds fields: plan.userId is required.')
    return
  }

  const userId = plan.userId.toString()

  if (userId == null || typeof userId !== 'string') {
    console.error('Cannot update training plan.dates runIds fields: plan.userId could not be coerced into a string.')
    return 
  }

  // Check the plan date range
  if (plan.startDate == null) {
    console.error('Cannot update training plan.dates runIds fields: plan.startDate is required.')
    return
  }

  if (plan.endDate == null) {
    console.error('Cannot update training plan.dates runIds fields: plan.endDate is required.')
    return
  }

  const startDateDT = DateTime.fromJSDate(plan.startDate)
  const endDateDT = DateTime.fromJSDate(plan.endDate)

  // Get all of the runs in the plan date range
  const dailyStats = await DailyStatsModel.find({
    date: {
      $gte: startDateDT.startOf('day').toJSDate(),
      $lt: endDateDT.startOf('day').plus({ 'day': 1 }).toJSDate(),
    },
    userId: userId,
  }, {
    date: true,
    runIds: true,
  }).exec()

  // Organize the runs by date
  // TODO: Isn't this data in DailyStats model? ds.runIds?
  let runIdsByDate = {}
  for (let ds of dailyStats) {
    const dateISO = DateTime.fromJSDate(ds.date, {zone: 'utc'}).toISODate()
    runIdsByDate[dateISO] = ds.runIds
  }

  // For each date in the plan, copy the date
  for (let planDate of plan.dates) {
    const dateISO = DateTime.fromJSDate(planDate.dateISO, {zone: 'utc'}).toISODate()
    planDate.runIds = runIdsByDate[dateISO]
  }

  return plan
}

export default recalculatePlanRunIds
