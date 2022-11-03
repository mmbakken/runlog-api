import mongoose from 'mongoose'
import { DateTime } from 'luxon'

import addFloats from '../utils/addFloats.js'
import TrainingModel from '../db/TrainingModel.js'

// All training plans for this user that include the run date will have their actualDistance fields
// updated to reflect this newly created run.
const updateTrainingPlanDistances = async (run, user) => {
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
    console.log(`No training plans found for this user that include local run start date of "${startOfRunLocalISOString}".`)
    return
  }

  // Increment actualDistance fields by the run's distance
  for (let plan of plans) {
    plan.actualDistance = addFloats(run.distance, plan.actualDistance)

    // Find the week to update
    for (let i = 0; i < plan.weeks.length; i++) {
      if (plan.weeks[i].startDateISO === startOfRunLocalISOString) {
        plan.weeks[i] = {
          ...plan.toObject().weeks[i],
          actualDistance: addFloats(plan.weeks[i].actualDistance, run.distance)
        }

        i = plan.weeks.length // Exit for-loop
      }
    }

    // Find the date to update
    let ISODateString
    for (let j = 0; j < plan.dates.length; j++) {
      ISODateString = DateTime.fromJSDate(plan.dates[j].dateISO, {zone: 'utc'}).toISODate().split('T')[0]

      if (ISODateString === startOfRunLocalISOString) {
        plan.dates[j] = {
          ...plan.toObject().dates[j],
          actualDistance: addFloats(plan.dates[j].actualDistance, run.distance)
        }

        j = plan.dates.length // Exit for-loop
      }
    }

    await plan.save()
  }
}

export default updateTrainingPlanDistances
