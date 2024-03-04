// This route is for handling the first verification request sent by Strava as part of
// their Webhook API.
//
// See scripts/createStravaWebhook.js for the initial create webhook POST request. This
// script must be run in order for Strava to know about this route.
//
// See: https://developers.strava.com/docs/webhooks/

const runlogStravaToken = 'RunlogStravaToken' // arbitrary string

const stravaWebhookVerification = (req, res) => {
  console.log('stravaWebhookVerification GET request made:')
  console.dir(req.query)

  if (
    req.query['hub.verify_token'] === runlogStravaToken &&
    req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.challenge'] != null
  ) {
    // This is the first callback from Strava to verify this callback URL.
    return res.json({
      'hub.challenge': req.query['hub.challenge'],
    })
  }

  console.error('req.query validation failed :(')
  return res.sendStatus(500)
}

export default stravaWebhookVerification
