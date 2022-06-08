import TrainingModel from '../db/TrainingModel.js'
import { DateTime, IANAZone } from 'luxon'

// Creates a new training plan for this user, saves it to the database, and returns the new training
// plan to the requestor.
const createTrainingPlan = async (req, res) => {
  // Parse the required and optional fields, then validate them
  const startDate = req.body.startDate // ISO Date like yyyy-mm-dd
  const startDT = DateTime.fromISO(startDate)
  const endDate = req.body.endDate // ISO Date like yyyy-mm-dd
  const endDT = DateTime.fromISO(endDate)
  const weekCount = req.body.weekCount
  const timezone = req.body.timezone
  const title = req.body.title
  const goal = req.body.goal

  if (startDate == null || !startDT.isValid) {
    return res.status(400).json({ error: 'Unable to create training plan: startDate field must be a valid ISO 8601 date string like yyyy-mm-dd'})
  }

  if (endDate == null || !endDT.isValid) {
    return res.status(400).json({ error: 'Unable to create training plan: endDate field must be a valid ISO 8601 date string like yyyy-mm-dd'})
  }

  if (endDT < startDT) {
    return res.status(400).json({ error: 'Unable to create training plan: startDate must come before endDate'})
  }

  if (weekCount == null || !Number.isInteger(weekCount) || weekCount < 1) {
    return res.status(400).json({ error: 'Unable to create training plan: weekCount must be a positive integer'})
  }

  if (startDT.plus({ days: (weekCount * 7) - 1}).toISODate() !== endDate) {
    return res.status(400).json({ error: 'Unable to create training plan: weekCount must be exactly the difference between start and end dates'})
  }

  if (timezone == null || typeof timezone !== 'string' || !IANAZone.isValidZone(timezone)) {
    return res.status(400).json({ error: 'Unable to create training plan: timezone must be a string'})
  }

  if (title == null || typeof title !== 'string') {
    return res.status(400).json({ error: 'Unable to create training plan: title must be a string'})
  }

  if (goal == null || typeof goal !== 'string') {
    return res.status(400).json({ error: 'Unable to create training plan: goal must be a string'})
  }

  const newPlan = {
    userId: req.user.id,
    startDate: startDate,
    endDate: endDate,
    weekCount: weekCount,
    timezone: timezone,
    title: title,
    goal: goal,
  }

  // TODO: Generateate the fields that are dependent on the dates

  // Save to db
  try {
    await TrainingModel.insertMany(newPlan)
    return res.json({ plan: newPlan })
  } catch (err) {
    console.error(err)
    return res.status(501).json({ message: 'Unable to create training plan to database.', error: err})
  }
}

export default createTrainingPlan
