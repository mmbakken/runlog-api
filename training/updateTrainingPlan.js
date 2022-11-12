import TrainingModel from '../db/TrainingModel.js'
import updatePlanActualDistances from './updatePlanActualDistances.js'

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
  let shouldUpdateActualDistances = false
  const validFields = Object.keys(TrainingModel.schema.paths)
  for (let [field, value] of Object.entries(req.body.updates)) {
    if (!validFields.includes(field)) {
      console.error(`Cannot update training plan with id "${plan._id}": Field "${field}" is not present in the document`)
      return res.sendStatus(400)
    }

    plan[field] = value

    // If either of the dates are updated, we need to recalculate the actualDistance fields for the plan
    if (!shouldUpdateActualDistances && (field === 'startDate' || field === 'endDate') && plan[field] !== value) {
      shouldUpdateActualDistances = true
    }
  }

  // If the dates of the plan have been edited, then we need to recalculate the actualDistance
  // fields for the new dates, new weeks, and plan total
  if (shouldUpdateActualDistances) {
    plan = await updatePlanActualDistances(plan)
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
