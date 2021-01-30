import {} from 'dotenv/config.js'
import axios from 'axios'
import FormData from 'form-data'

// Script to create the webhook callback from the Strava Webhook API.
// Should only run in production environments!
// See: https://developers.strava.com/docs/webhooks/

const runlogStravaToken = 'RunlogStravaToken' // arbitrary string

const createStravaWebhook = () => {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  const callbackURL = 'https://www.runlog.dev/api/v1/strava/webhook'

  // Params have to be sent as a form for some reason
  // Trying to use the curl -F option
  const form = new FormData()
  form.append('client_id', clientId)
  form.append('client_secret', clientSecret)
  form.append('callback_url', callbackURL)
  form.append('verify_token', runlogStravaToken)

  axios({
    method: 'post',
    url: 'https://www.strava.com/api/v3/push_subscriptions',
    data: form,
    headers: {'Content-Type': 'multipart/form-data' },
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
