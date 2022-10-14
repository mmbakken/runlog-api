import { DateTime } from 'luxon'
import TrainingModel from '../db/TrainingModel.js'

const updateTrainingPlanDate = async (req, res) => {
  let training

  try {
    training = await TrainingModel.findById(req.params.id)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }

  if (training == null) {
    console.error(`Training plan with id "${req.params.id}" was not found.`)
    return res.sendStatus(404)
  }

  if (req.body == null || req.body.updates == null) {
    console.error(`Cannot update date within training plan with id "${training._id}": Must include req.body.updates.`)
    return res.sendStatus(400)
  }

  // Make sure training plan has the date specified
  if (training.dates == null) {
    console.error(`Cannot update date within training plan with id "${training._id}": training.dates array is missing."`)
    return res.sendStatus(400)
  }

  let jsDate
  const trainingDate = training.dates.find(date => {
    jsDate = new Date(date._doc.dateISO)
    return jsDate.toISOString().split('T')[0] === req.params.dateISO
  })

  if (trainingDate == null) {
    console.error(`Cannot update date "${req.params.dateISO}" within training plan with id "${training._id}": training.dates does not contain this date."`)
    return res.sendStatus(400)
  }

  // Update the training plan date with new values
  const validFields = Object.keys(training.dates[0]._doc)

  for (let [field, value] of Object.entries(req.body.updates)) {
    if (!validFields.includes(field)) {
      console.error(`Cannot update date "${req.params.dateISO}" within training plan with id "${training._id}": Field "${field}" is not present in the date document`)
      return res.sendStatus(400)
    }

    // Do we need to update the week.plannedDistance and plan.plannedDistance fields?
    if (field === 'plannedDistance') {
      // Difference of new value and old value added to plan.plannedDistance and appropriate
      // weekly.plannedDistance, based on date.
      const thisDateDT = DateTime.fromISO(req.params.dateISO, { zone: 'utc' })

      let weekStartDT
      let weekEndDT
      const thisWeek = training.weeks.find( week => {
        weekStartDT = DateTime.fromISO(week.startDateISO, { zone: 'utc' })
        weekEndDT = weekStartDT.plus({ days: 6 })
        return (thisDateDT.equals(weekStartDT)) || (thisDateDT.equals(weekEndDT)) || (weekStartDT < thisDateDT && thisDateDT < weekEndDT)
      })

      if (thisWeek == null) {
        console.error(`Unable to find week containing ${req.params.dateISO}. Aborting training plan update.`)
        return res.sendStatus(500)
      }

      const diff = (value - trainingDate.plannedDistance)
      training.plannedDistance += diff
      thisWeek.plannedDistance += diff
    }

    trainingDate[field] = value
  }

  try {
    await training.save()
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }

  return res.json(training.toObject())
}

export default updateTrainingPlanDate
