// This route is for handling requests sent by Strava as part of their Webhook API.
// When a new activity is added to Strava or a user deauthorizes Runlog from their OAuth 
// access, this endpoint will handle updating our records accordingly.
//
// See scripts/createStravaWebhook.js for the initial create webhook POST request. This
// script must be run in order for Strava to know about this route.
//
// See: https://developers.strava.com/docs/webhooks/


const stravaWebhookHandler = (req, res) => {
  console.log('stravaWebhookHandler POST request made:')
  console.dir(req.body)

  // TODO: Handle all of the various webhook updates:
  // New activity
  // Updated activity
  // Deleted activity (should I handle this??)


  // TODO: Log any webhook updates that are NOT handled yet so you can see examples.
  
  // We must respond within 2 seconds, or else the request may be sent again.
  return res.sendStatus(200)
}

export default stravaWebhookHandler
