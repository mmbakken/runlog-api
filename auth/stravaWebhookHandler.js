import axios from 'axios'
import UserModel from '../db/UserModel.js'
import { useFreshTokens } from '../auth/stravaTokens.js'
import createRunFromStravaActivity from '../runs/createRunFromStravaActivity.js'

// This route is for handling requests sent by Strava as part of their Webhook API.
// When a new activity is added to Strava or a user deauthorizes Runlog from their OAuth 
// access, this endpoint will handle updating our records accordingly.
//
// See scripts/createStravaWebhook.js for the initial create webhook POST request. This
// script must be run in order for Strava to know about this route.
//
// See: https://developers.strava.com/docs/webhooks/
const stravaWebhookHandler = async (req, res) => {
  console.log('Strava made a webhook POST request:')
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
    console.error('Got a weirdly formatted request to stravaWebhookHandler. Aborting.')
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
    // Look up user by strava athlete id in mongo and get the token
    const user = await UserModel.findOne({ stravaUserId: req.body.owner_id })

    if (user == null) {
      console.error(`No user found for Strava athlete id "${req.body.owner_id}"`)
      return
    }

    const freshAccessToken = await useFreshTokens(user)

    try {
      // Fetch the Activity details from the Strava API so we can create a Run document from it.
      const response = await axios({
        method: 'get',
        url: `https://www.strava.com/api/v3/activities/${req.body.object_id}`,
        params: {
          include_all_efforts: false,
        },
        headers: {
          Authorization: `Bearer ${freshAccessToken}`,
        }
      })

      await createRunFromStravaActivity(user, response.data)
    } catch (err) {
      console.error(err)
    }

  } else {
    console.log('Unsupported webhook callback message body. Might want to implement this?')
  }
}

export default stravaWebhookHandler
