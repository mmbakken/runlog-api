import TrainingModel from '../db/TrainingModel.js'
import RunModel from '../db/RunModel.js'
import { DateTime, IANAZone } from 'luxon'

// Creates a new training plan for this user, saves it to the database, and returns the new training
// plan to the requestor.
const createTrainingPlan = async (req, res) => {
  // Parse the required and optional fields, then validate them
  const startDate = req.body.startDate // ISO Date like yyyy-mm-dd
  const startDT = DateTime.fromISO(req.body.startDate)
  const endDate = req.body.endDate // ISO Date like yyyy-mm-dd
  const endDT = DateTime.fromISO(req.body.endDate)
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

  // Get all of the runs that have occurred during this plan's date range
  const runs = await RunModel.find({
    startDate: {
      $gte: startDT.startOf('day').toISODate(),
      $lt: endDT.plus({ days: 1 }).startOf('day').toISODate(),
    }
  }).lean()

  let runMap = {}
  let runDates = []

  if (runs.length) {
    runs.sort((runA, runB) => {
      return runA.startDate - runB.startDate
    })

    let runStartDateISOString

    // Create a map of runs on their ISO date strings for fast lookup
    runs.forEach((run) => {
      runStartDateISOString = DateTime.fromJSDate(run.startDate, { zone: 'utc' }).startOf('day').toISODate()
      runMap[runStartDateISOString] = run
      runDates.push(runStartDateISOString)
    })
  }

  let planActualDistance = 0

  // Generate a week object to track the week-specific stuff for this plan
  const dates = []
  const weeks = []
  let weekActualDistance

  for (let i = 0; i < weekCount; i++) {
    weekActualDistance = 0

    // Generate an object for each date within this training plan's date range
    let dateISOString

    for (let j = 0; j < 7; j++) {
      let dateActualDistance = 0
      dateISOString = startDT.plus({ days: (i * 7) + j }).startOf('day').toISODate()

      if (runs.length && runDates.includes(dateISOString)) {
        dateActualDistance = runMap[dateISOString].distance
        weekActualDistance += dateActualDistance
      }

      dates.push({
        dateISO: dateISOString,
        actualDistance: dateActualDistance,
        plannedDistance: 0,
        workout: '',
        workoutCategory: 0, // Index of the category enum, see runlog-api/constants/workoutCategories.js
      })
    }

    weeks.push({
      startDateISO: startDT.plus({ days: (i * 7) }).toISODate(),
      actualDistance: weekActualDistance,
      plannedDistance: 0,
    })

    planActualDistance += weekActualDistance
  }

  const newPlan = {
    userId: req.user.id,
    startDate: startDate,
    endDate: endDate,
    weekCount: weekCount,
    timezone: timezone,
    title: title,
    goal: goal,
    isActive: isActive,
    actualDistance: planActualDistance,
    plannedDistance: 0,
    weeks: weeks,
    dates: dates,
    journal: [],
  }

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
