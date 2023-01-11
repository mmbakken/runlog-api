import {} from 'dotenv/config.js'
import { DateTime } from 'luxon'
import connectToMongo from '../../db/connectToMongo.js'
import disconnectFromMongo from '../../db/disconnectFromMongo.js'
import RunModel from '../../db/RunModel.js'
import DailyStatsModel from '../../db/DailyStatsModel.js'
import UserModel from '../../db/UserModel.js'

import createRunFromStravaActivity from '../../runs/createRunFromStravaActivity.js'

// Script to create a single run (and matching DailyStats) to the current date in the local development database. Remove existing runs on this date.
// Do not use this script on prod!

const addRunToday = async () => {
  await connectToMongo()

  if (process?.env?.APP_ENV !== 'dev') {
    console.erorr('Do not use this script in prod! It drops all of the runs and daily stats for today\'s date. Only use in dev.')
    return -1
  }

  try {
    const nowLocalDT = DateTime.now()
    const startOfNewRunDT = nowLocalDT.set({
      hour: 10,
      minute: 0,
      seconds: 0,
      millisecond: 0,
    }) // 10am today, local time (Denver), as UTC timestamp
    const startOfNewRunUTC = startOfNewRunDT.toUTC()
    const startOfNewRunLocal = startOfNewRunDT.setZone('utc', { keepLocalTime: true }) // 10am today, UTC. This copies how Strava tracks this field. Unsure why we want this field but here we are.

    console.log(`startOfNewRunUTC: ${startOfNewRunUTC}`)
    console.log(`startOfNewRunLocal: ${startOfNewRunLocal}`)

    // Delete all runs and daily stats on this date
    const runs = await RunModel.find({
      startDate: {
        $gte: startOfNewRunUTC.startOf('day').toJSDate(),
        $lt: startOfNewRunUTC.plus({ day: 1 }).startOf('day').toJSDate(),
      }
    }).lean().exec()

    console.log('Deleting these runs and their daily stats:')
    console.dir(runs)

    const resultsRuns = await RunModel.deleteMany({
      startDate: {
        $gte: startOfNewRunUTC.startOf('day').toJSDate(),
        $lt: startOfNewRunUTC.plus({ day: 1 }).startOf('day').toJSDate(),
      }
    })

    console.log(`Deleted ${resultsRuns.deletedCount} runs`)

    const resultsDS = await DailyStatsModel.deleteMany({
      date: {
        $gte: startOfNewRunUTC.startOf('day').toJSDate(),
        $lt: startOfNewRunUTC.plus({ day: 1 }).startOf('day').toJSDate(),
      }
    })

    console.log(`Deleted ${resultsDS.deletedCount} ds`)

    // Create new run and dailystats for this date
    const email = 'mmbakken@gmail.com'
    const user = await UserModel.findOne({ email: email })

    if (user == null) {
      console.error(`No user id found with email: ${email}`)
      return -1
    }

    const run = {
      userId : user._id,
      type: 'Run',
      name: 'Morning Run',
      start_date: `${startOfNewRunDT.toISODate()}T${startOfNewRunDT.toISOTime()}`,
      start_date_local: `${startOfNewRunLocal.toISODate()}T${startOfNewRunLocal.toISOTime()}`,
      timezone: '(GMT-07:00) America/Denver',
      moving_time: 2491,
      distance: 8497.1,
      average_speed: 3.411,
      total_elevation_gain: 57.7,
      has_heartrate: true,
      average_heartrate: 149.3,
      max_heartrate: 167,
      device_name: 'Garmin Forerunner 245',
      id: '1234',
      external_id: 'garmin_push_6358009720',
      start_latlng: [39.758085, -104.989269],
    }

    await createRunFromStravaActivity(user, run)

    console.log('Created all runs and daily stats')
    return 1
  } catch (error) {
    console.error(error)
    return -1
  } finally {
    disconnectFromMongo()
  }
}

addRunToday()
