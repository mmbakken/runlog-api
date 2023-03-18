import TrainingModel from '../db/TrainingModel.js'
import { DateTime, IANAZone } from 'luxon'

import updatePlanDistances from '../training/updatePlanDistances.js'

// Creates a new training plan for this user, saves it to the database, and returns the new training
// plan to the requestor.
const createTrainingPlan = async (req, res) => {
  // Parse the required and optional fields, then validate them
  const startDate = req.body.startDate // ISO Date like yyyy-mm-dd
  const startDT = DateTime.fromISO(req.body.startDate, { zone: 'utc' }).startOf('day')
  const endDate = req.body.endDate // ISO Date like yyyy-mm-dd
  const endDT = DateTime.fromISO(req.body.endDate, { zone: 'utc' }).startOf('day')
  const weekCount = req.body.weekCount
  const timezone = req.body.timezone
  const title = req.body.title
  const goal = req.body.goal
  const isActive = req.body.isActive == null ? false : req.body.isActive

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

  // Generate a week object to track the week-specific stuff for this plan
  const dates = []
  const weeks = []
  for (let i = 0; i < weekCount; i++) {
    // Generate an object for each date within this training plan's date range
    let date

    for (let j = 0; j < 7; j++) {
      let dateActualDistance = 0
      date = startDT.plus({ days: (i * 7) + j }).startOf('day').toJSDate()

      dates.push({
        dateISO: date,
        actualDistance: dateActualDistance,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
        workout: '',
        workoutCategory: 0, // Index of the category enum, see runlog-api/constants/workoutCategories.js
      })
    }

    weeks.push({
      startDateISO: startDT.plus({ days: (i * 7) }).toISODate(),
      plannedDistance: 0,
      plannedDistanceMeters: 0,
    })
  }

  let newPlan = {
    userId: req.user._id,
    startDate: startDate,
    endDate: endDate,
    weekCount: weekCount,
    timezone: timezone,
    title: title,
    goal: goal,
    isActive: isActive,
    plannedDistance: 0,
    plannedDistanceMeters: 0,
    weeks: weeks,
    dates: dates,
    journal: [],
  }

  // Save to db
  try {
    newPlan = await updatePlanDistances(newPlan)
    await TrainingModel.insertMany(newPlan)
    return res.json({ plan: newPlan })
  } catch (err) {
    console.error(err)
    return res.status(501).json({ message: 'Unable to create training plan to database.', error: err})
  }
}

export default createTrainingPlan
