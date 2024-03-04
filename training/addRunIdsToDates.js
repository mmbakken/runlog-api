import RunModel from '../db/RunModel.js'
import { DateTime } from 'luxon'

// Given an array of plan.dates objects,
// returns a new array of plan.dates objects with the runIds array populated
const addRunIdsToDates = async (dates, startDateDT, endDateDT, userId) => {
  let newDates = []

  // Find all of the runs on all of the plan dates
  const runs = await RunModel.find(
    {
      startDateLocal: {
        $gte: startDateDT,
        $lt: endDateDT.plus({ days: 1 }).startOf('day'),
      },
      userId: userId.toString(),
    },
    {
      _id: true,
      startDate: true,
    }
  ).lean()

  // Group the run IDs by date
  const runsByDate = {}
  runs.map((run) => {
    const dateISO = DateTime.fromJSDate(run.startDate, { zone: run.timezone })
      .toISODate()
      .split('T')[0]
    let datesArray = runsByDate[dateISO]

    if (datesArray == null) {
      runsByDate[dateISO] = [run._id.toString()]
    } else {
      runsByDate[dateISO].push(run._id.toString())
    }
  })

  // For each date, add the run ids found earlier
  for (let date of dates) {
    const dateISO = DateTime.fromJSDate(date.dateISO, { zone: 'utc' })
      .toISODate()
      .split('T')[0]

    newDates.push({
      ...date,
      runIds: runsByDate[dateISO] || [],
    })
  }

  return newDates
}

export default addRunIdsToDates
