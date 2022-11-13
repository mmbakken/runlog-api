import { DateTime } from 'luxon'
import TrainingModel from '../db/TrainingModel.js'

import addFloats from '../utils/addFloats.js'

const updateTrainingPlanDate = async (req, res) => {
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
    console.error(`Cannot update date within plan with id "${plan._id}": Must include req.body.updates.`)
    return res.sendStatus(400)
  }

  // Make sure plan has the date specified
  if (plan.dates == null) {
    console.error(`Cannot update date within plan with id "${plan._id}": plan.dates array is missing."`)
    return res.sendStatus(400)
  }

  let jsDate
  const date = plan.dates.find(dateObj => {
    jsDate = new Date(dateObj._doc.dateISO)
    return jsDate.toISOString().split('T')[0] === req.params.dateISO
  })

  if (date == null) {
    console.error(`Cannot update date "${req.params.dateISO}" within plan with id "${plan._id}": plan.dates does not contain this date."`)
    return res.sendStatus(400)
  }

  // Update the plan date with new values
  const validFields = Object.keys(plan.dates[0]._doc)

  for (let [field, value] of Object.entries(req.body.updates)) {
    if (!validFields.includes(field)) {
      console.error(`Cannot update date "${req.params.dateISO}" within plan with id "${plan._id}": Field "${field}" is not present in the date document`)
      return res.sendStatus(400)
    }

    // Do we need to update the week.plannedDistance and plan.plannedDistance fields?
    if (field === 'plannedDistance') {
      // Difference of new value and old value added to plan.plannedDistance and appropriate
      // weekly.plannedDistance, based on date.
      const thisDateDT = DateTime.fromISO(req.params.dateISO, { zone: 'utc' })

      let weekStartDT
      let weekEndDT
      const thisWeek = plan.weeks.find( week => {
        weekStartDT = DateTime.fromISO(week.startDateISO, { zone: 'utc' })
        weekEndDT = weekStartDT.plus({ days: 6 })
        return (thisDateDT.equals(weekStartDT)) || (thisDateDT.equals(weekEndDT)) || (weekStartDT < thisDateDT && thisDateDT < weekEndDT)
      })

      if (thisWeek == null) {
        console.error(`Unable to find week containing ${req.params.dateISO}. Aborting plan update.`)
        return res.sendStatus(500)
      }

      const diff = addFloats(value,  -1 * date.plannedDistance) // Find the difference between new and old value
      plan.plannedDistance = addFloats(diff, plan.plannedDistance)
      thisWeek.plannedDistance = addFloats(diff, thisWeek.plannedDistance)
    }

    date[field] = value
  }

  try {
    await plan.save()
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }

  return res.json(plan.toObject())
}

export default updateTrainingPlanDate
