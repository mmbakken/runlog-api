import TrainingModel from '../db/TrainingModel.js'
import updatePlanDistances from './updatePlanDistances.js'

import { METERS_PER_MILE } from '../constants/unitConversion.js'

const updateTrainingPlan = async (req, res) => {
  let plan

  try {
    plan = await TrainingModel.findById(req.params.id)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }

  if (plan == null) {
    console.error(`Training plan with id "${req.params.id}" was not found.`)
    return res.sendStatus(404)
  }

  if (req.body == null || req.body.updates == null) {
    console.error(`Cannot update training plan with id "${plan._id}": Must include req.body.updates.`)
    return res.sendStatus(400)
  }

  // Update the plan with new values
  let shouldUpdateDistances = false
  const validFields = Object.keys(TrainingModel.schema.paths)
  for (let [field, value] of Object.entries(req.body.updates)) {
    if (!validFields.includes(field)) {
      console.error(`Cannot update training plan with id "${plan._id}": Field "${field}" is not present in the document`)
      return res.sendStatus(400)
    }

    // Do not allow the user to update this field directly. Its value is determined by the
    // plannedDistance field, just expressed as a different unit (meters instead of miles).
    if (field === 'plannedDistanceMeters') {
      continue
    }

    if (field === 'plannedDistance') {
      plan['plannedDistanceMeters'] = Math.round(value * METERS_PER_MILE * 100) / 100
    }

    // For each week and each date, calculate the plannedDistanceMeters field
    else if (field === 'weeks') {
      value = value.map((week) => {
        return ({
          ...week,
          plannedDistanceMeters: Math.round(week.plannedDistance * METERS_PER_MILE * 100) / 100,
        })
      })
    }

    else if (field === 'dates') {
      value = value.map((date) => {
        return ({
          ...date,
          plannedDistanceMeters: Math.round(date.plannedDistance * METERS_PER_MILE * 100) / 100,
        })
      })
    }

    // If either of the dates are updated, we need to recalculate the actualDistance fields for the plan
    if (!shouldUpdateDistances && (field === 'startDate' || field === 'endDate') && plan[field] !== value) {
      shouldUpdateDistances = true
    }

    plan[field] = value
  }

  // If the dates of the plan have been edited, then we need to recalculate the actualDistance
  // fields for the new dates, new weeks, and plan total
  if (shouldUpdateDistances) {
    plan = await updatePlanDistances(plan)
  }

  try {
    await plan.save()
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }

  return res.json(plan.toObject())
}

export default updateTrainingPlan
