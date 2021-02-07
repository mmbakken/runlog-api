import {} from 'dotenv/config.js'
import axios from 'axios'

// Script to view the webhook subscription to the Strava Webhook API.
// See: https://developers.strava.com/docs/webhooks/

const viewStravaWebhook = async () => {
  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET

  try {
    const response = await axios({
      method: 'get',
      url: 'https://www.strava.com/api/v3/push_subscriptions',
      params: {
        client_id: clientId,
        client_secret: clientSecret,
      }
    })

    // Response will happen after callback URL echoes the Strava request
    // sent to it. See callbackURL route for details.
    console.log('Strava webhook subscriptions:')
    console.dir(response.data)
  } catch (error) {
    console.error(error)
  }
}

viewStravaWebhook()
