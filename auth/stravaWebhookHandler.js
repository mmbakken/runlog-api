import axios from 'axios'
import connectToMongo from '../db/connectToMongo.js'
import UserModel from '../db/UserModel.js'
import RunModel from '../db/RunModel.js'
import { useFreshTokens } from '../auth/stravaTokens.js'

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
    const db = await connectToMongo()

    // Look up user by strava athlete id in mongo and get the token
    const user = await UserModel.findOne({ stravaUserId: athleteId })

    if (user == null) {
      console.error(`No user found for Strava athlete id "${athleteId}"`)
      db.close()
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
      db.close()
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

      db.close()
      return
    } else {
      console.log('Activity already exists in db. Will not add a duplicate.')
      db.close()
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

  if (req.body.object_type === 'activity' && req.body.aspect_type === 'create') {
    await createNewActivity(req.body.object_id, req.body.owner_id)
  } else {
    console.log('Unsupported webhook callback message body. Might want to implement this?')
  }
}

export default stravaWebhookHandler
