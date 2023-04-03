import { DateTime } from 'luxon'

import updatePlanDistances from '../training/updatePlanDistances.js'
import TrainingModel from '../db/TrainingModel.js'

const updatePlanDateRunIds = (plan, dateISO, runId) => {
  // For this plan, find the date of the run
  for (let planDate of plan.dates) {
    const planDateISO = DateTime.fromJSDate(planDate.dateISO, { zone: 'utc' }).toISODate()

    if (planDateISO === dateISO) {
      planDate.runIds.push(runId)
    }
  }

  return plan
}

// Takes a new run and the user it belongs to. Updates each affected plan with this new distance.
// Updates the plan date for this run
const updatePlansFromRun = async (run, userId) => {
  if (run == null) {
    console.error('Cannot update training plan actualDistance fields: run is required.')
    return
  }

  if (run.distance == null) {
    console.error('Cannot update training plan actualDistance fields: run.distance is required.')
    return
  }

  if (userId == null) {
    console.error('Cannot update training plan actualDistance fields: userId is required.')
    return
  }

  // Local start date of the run is what matters here. This is the date the user thinks their run
  // happened on - using UTC date would be a mistake for (e.g.) 8pm runs when user is in North America!
  const startOfRunLocalDT = DateTime.fromJSDate(run.startDateLocal, { zone: 'utc' }).startOf('day')
  const startOfRunLocalISOString = startOfRunLocalDT.toISODate().split('T')[0]

  // Find all impacted plans
  const plans = await TrainingModel.find({
    startDate: { $lte: startOfRunLocalDT.toJSDate() },
    endDate: { $gte: startOfRunLocalDT.toJSDate() },
    userId: userId,
  }).exec()

  if (plans == null || plans.length === 0) {
    console.log(`updatePlansFromRun: No training plans found for this user that include local run start date of "${startOfRunLocalISOString}". Will not modify any plans.`)
    return
  }
  
  for (let plan of plans) {
    // Recalculate the plan, week, and date actualDistance fields for each plan this run's date belongs to.
    plan = await updatePlanDistances(plan)

    // Add the run id to its plan date
    plan = await updatePlanDateRunIds(plan, startOfRunLocalISOString, run._id.toString())
    await plan.save()
  }
}

export default updatePlansFromRun
