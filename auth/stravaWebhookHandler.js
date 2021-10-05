import axios from 'axios'
import UserModel from '../db/UserModel.js'
import RunModel from '../db/RunModel.js'
//import DailyStatsModel from '../db/DailyStatsModel.js'
import { useFreshTokens } from '../auth/stravaTokens.js'
import generateTitle from '../runs/generateTitle.js'
//import { DateTime } from 'luxon'

// This route is for handling requests sent by Strava as part of their Webhook API.
// When a new activity is added to Strava or a user deauthorizes Runlog from their OAuth 
// access, this endpoint will handle updating our records accordingly.
//
// See scripts/createStravaWebhook.js for the initial create webhook POST request. This
// script must be run in order for Strava to know about this route.
//
// See: https://developers.strava.com/docs/webhooks/

const createNewActivity = async (activityId, athleteId) => {
  try {
    // Look up user by strava athlete id in mongo and get the token
    const user = await UserModel.findOne({ stravaUserId: athleteId })

    if (user == null) {
      console.error(`No user found for Strava athlete id "${athleteId}"`)
      return
    }

    const freshAccessToken = await useFreshTokens(user)

    const response = await axios({
      method: 'get',
      url: `https://www.strava.com/api/v3/activities/${activityId}`,
      params: {
        include_all_efforts: false,
      },
      headers: {
        Authorization: `Bearer ${freshAccessToken}`,
      }
    })

    const runExists = await RunModel.exists({ stravaActivityId: activityId })

    // Make sure we want to track it
    if (response.data.type !== 'Run') {
      console.log('Activity was not a run, disregard this one.')
      return
    }

    // Only add to db if this is a new activity
    if (!runExists) {
      const newRun = await RunModel.create({
        userId: user._id,
        name: response.data.name,
        startDate: response.data.start_date,
        startDateLocal: response.data.start_date_local,
        timezone: response.data.timezone,
        time: response.data.moving_time,
        title: generateTitle(response.data.start_date),
        distance: response.data.distance,
        averageSpeed: response.data.average_speed,
        totalElevationGain: response.data.total_elevation_gain,
        hasHeartRate: response.data.has_heartrate,
        averageHeartRate: response.data.average_heartrate,
        maxHeartRate: response.data.max_heartrate,
        deviceName: response.data.device_name,
        stravaActivityId: response.data.id,
        stravaExternalId: response.data.external_id,
        startLatitude: response.data.start_latitude,
        startLongitude: response.data.start_longitude,
      })

      console.log(`New run created successfully. Runlog Id: "${newRun._id}", Strava activityId: "${activityId}"`)

//        A new run means daily totals have changed.
//        Either create a new DailyStats document for this date, or look up the existing DailyStats
//        document for this date and add distances and this runId to the document.
//       const date = DateTime.fromISO(response.data.start_date)
//       const priorDailyStats = await DailyStatsModel.find({ date: date.toISODate() })
// 
//        None exists => Make a new DailyStats document and save it
//       if (priorDailyStats == null) {
//          Need to determine the running totals for the other distance fields
//         let sevenDayDistance = newRun.distance
//         let weeklyDistance = newRun.distance
// 
//          These distances are determined by the distances of (at most) the previous 6 days of runs
//         const previousDailyStats = await DailyStatsModel.find({
//           date: {
//             $or: [
//               {$gte: date.minus({ days: 6 }).toISODate() },
//               {$lte: date.toISODate() }
//             ]
//           }
//         })
// 
//          How many days earlier is the start of this week?
// 
//          For each of the previous six consecutive dates (if any), add the distance to the weekly
//          and sevenDay mileage, if applicable.
// 
//          Is the previous date we're considering part of the new run's week?
//         let isInCurrentWeek = date.weekday - user.stats.startOfWeek
// 
//          For all 6 previous dates, check if there's a dailyStats object
//          If so, add to the sevenDayDistance and check if this is in the current week
//          Regardless
//         const previousSixDates = [
//           date.minus({ days: 1 }).toISODate(),
//           date.minus({ days: 2 }).toISODate(),
//           date.minus({ days: 3 }).toISODate(),
//           date.minus({ days: 4 }).toISODate(),
//           date.minus({ days: 5 }).toISODate(),
//           date.minus({ days: 6 }).toISODate()
//         ]
// 
//         for (let i = 0; i< previousDailyStats.length; i++) {
//            Always add to the sevenDay total
//           sevenDayDistance += previousDailyStats[i].distance
// 
//            Only add to the weekly total if this date is in the same week as the new run's date
//            
// 
//           await previousDailyStats[i].save()
//         }
// 
//          Save the new DailyStats
//         await DailyStatsModel.create({
//           userId: user._id,
//           date: date.toISODate(),
//           runIds: [newRun._id],
//           title: newRun.title,
//           distance: newRun.distance,
//           sevenDayDistance: sevenDayDistance,
//           weeklyDistance: weeklyDistance,
//         })
//       } else {
//          Update the distances, runIds, and title
//         priorDailyStats.title = 'Multiple runs'
//         priorDailyStats.runIds = [
//           ...priorDailyStats.runIds,
//           newRun._id,
//         ]
//         priorDailyStats.distance += newRun.distance
//         priorDailyStats.sevenDayDistance += newRun.distance
//         priorDailyStats.weeklyDistance += newRun.distance  Same date => nothing fancy needed here
//         await priorDailyStats.save()
//       }

      return
    } else {
      console.log('Activity already exists in db. Will not add a duplicate.')
      return
    }
  } catch (err) {
    console.error(err)
  }
}

const stravaWebhookHandler = async (req, res) => {
  console.log('stravaWebhookHandler POST request made:')
  console.dir(req.body)

  // Immediately return a '200 OK' response so we don't get spammed with repeated updates.
  // Any errors will be logged and handled without any notice to Strava's Webhook API.
  res.sendStatus(200)

  // Validation of params
  if (
    req.body == null ||
    req.body.aspect_type == null ||
    req.body.object_id == null ||
    req.body.object_type == null ||
    req.body.owner_id == null
  ) {
    console.error('Got a weirdly formatted request to stravaWebhookHandler.')
    return
  }

  // Ok the body looks fine - what kind of update is being sent to us?

  // E.g. New activity:
  // {
  //   aspect_type: 'create',     // Helps distinguish this
  //   event_time: 1612050850,    // Is this useful?
  //   object_id: 4707943142,     // Either an athlete or activity id
  //   object_type: 'activity',   // What sort of thing is the object_id
  //   owner_id: 8843745,         // Athlete ID
  //   subscription_id: 179879,   // Can change if we delete and re-create the webhook
  //   updates: {}
  // }

  // E.g. Updated title of existing activity
  // {
  //   aspect_type: 'update',
  //   event_time: 1612043784,
  //   object_id: 4701633893,
  //   object_type: 'activity',
  //   owner_id: 8843745,
  //   subscription_id: 179879,
  //   updates: { title: 'Easy run' }
  // }

  // E.g. User deauthorizes Runlog from their Strava account
  // {
  //   aspect_type: 'update',
  //   event_time: 1612570859,
  //   object_id: 8843745,
  //   object_type: 'athlete',
  //   owner_id: 8843745,
  //   subscription_id: 179879,
  //   updates: { authorized: 'false' }
  // }

  if (req.body.object_type === 'activity' && req.body.aspect_type === 'create') {
    await createNewActivity(req.body.object_id, req.body.owner_id)
  } else {
    console.log('Unsupported webhook callback message body. Might want to implement this?')
  }
}

export default stravaWebhookHandler
