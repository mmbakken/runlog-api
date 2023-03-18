import mongoose from 'mongoose'
import { DateTime } from 'luxon'

import updatePlanDistances from '../training/updatePlanDistances.js'
import TrainingModel from '../db/TrainingModel.js'

// Takes a new run and the user it belongs to. Updates each affected plan with this new distance.
const addRunDistanceToPlans = async (run, user) => {
  if (user == null) {
    console.error('Cannot update training plan actualDistance fields: run is required.')
    return
  }

  if (run.distance == null) {
    console.error('Cannot update training plan actualDistance fields: run.distance is required.')
    return
  }

  if (user == null) {
    console.error('Cannot update training plan actualDistance fields: user is required.')
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
    userId: mongoose.Types.ObjectId(user._id),
  }).exec()

  if (plans == null || plans.length === 0) {
    console.log(`addRunDistanceToPlans: No training plans found for this user that include local run start date of "${startOfRunLocalISOString}". Will not modify any plans.`)
    return
  }

  // Recalculate the plan, week, and date actualDistance fields for each plan this run's date belongs to.
  for (let plan of plans) {
    plan = await updatePlanDistances(plan)
    await plan.save()
  }
}

export default addRunDistanceToPlans
