import {} from 'dotenv/config.js'
import axios from 'axios'
import qs from 'qs'

// Script to create the webhook callback from the Strava Webhook API.
// Runlog API must be up and running on production for this to work! Must be able to hit
// the callbackURL specified. See stravaWebhookVerification.js for details.
// See: https://developers.strava.com/docs/webhooks/

const runlogStravaToken = 'RunlogStravaToken' // arbitrary string

const createStravaWebhook = () => {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  const callbackURL = 'https://www.runlog.dev/api/v1/strava/webhook'

  axios({
    method: 'post',
    url: 'https://www.strava.com/api/v3/push_subscriptions',
    data: qs.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      callback_url: callbackURL,
      verify_token: runlogStravaToken,
    })
  }).then((response) => {
    // Response will happen after callback URL echoes the Strava request
    // sent to it. See callbackURL route for details.
    console.log('Subscription response:')
    console.dir(response.data)
  }).catch((error) => {
    console.error(error.toJSON())
  })
}

createStravaWebhook()
