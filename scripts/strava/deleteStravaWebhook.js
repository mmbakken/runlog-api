import {} from 'dotenv/config.js'
import axios from 'axios'

// Script to delete the webhook callback from the Strava Webhook API.
// See: https://developers.strava.com/docs/webhooks/

const deleteStravaWebhook = () => {
  if (process.argv.length !== 3 || process.argv[2] == null) {
    console.log('Usage: $ node scripts/deleteStravaWebhook.js <subscriptionId>')
    return -1
  }

  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  const subscriptionId = process.argv[2]

  console.log(
    `Attempting to delete Strava webhook subscription with id: "${subscriptionId}"`
  )

  axios({
    method: 'delete',
    url: `https://www.strava.com/api/v3/push_subscriptions/${subscriptionId}`,
    data: {
      client_id: clientId,
      client_secret: clientSecret,
    },
  })
    .then((response) => {
      // Response will happen after callback URL echoes the Strava request
      // sent to it. See callbackURL route for details.
      console.log('Deletion response:')
      console.dir(response.data)
    })
    .catch((error) => {
      console.error(error.toJSON())
    })
}

deleteStravaWebhook()
