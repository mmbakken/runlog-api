import connectToMongo from '../../db/connectToMongo.js'
import disconnectFromMongo from '../../db/disconnectFromMongo.js'
import DailyStatsModel from '../../db/DailyStatsModel.js'
import { DateTime } from 'luxon'

// Test script for using the $gte and $lte queries inside a .find call
const findRunsWithinSixDays = async () => {
  connectToMongo()

  // Get each run document, figure out the correct title using startTime and timezone, save run

  try {
    const date = DateTime.utc(2021, 9, 20)

    const runs = await DailyStatsModel.find(
      {
        date: {
          $or: [
            { $gte: date.minus({ days: 6 }).toISODate() },
            { $lte: date.plus({ days: 6 }).toISODate() },
          ],
        },
      },
      '_id date'
    ).lean()

    console.dir(runs)

    return
  } catch (err) {
    console.error(err)
  }

  disconnectFromMongo()
}

findRunsWithinSixDays()
