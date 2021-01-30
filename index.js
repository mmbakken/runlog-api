import {} from 'dotenv/config.js'
import express from 'express'
import cors from 'cors'

// Authentication
import authenticateToken from './auth/authenticateToken.js'
import login from './auth/login.js'
import stravaCodeToTokens from './auth/stravaCodeToTokens.js'
import stravaWebhookVerification from './auth/stravaWebhookVerification.js'
import stravaWebhookHandler from './auth/stravaWebhookHandler.js'
import getUserDetails from './auth/getUserDetails.js'

// Runs
import getStravaRuns from './runs/getStravaRuns.js'

const app = express()
const port = 4000

// Only use CORS for dev environment
if (process.env.USE_CORS === 'true') {
  console.log('Using CORS')
  app.use(cors())
}

// Able to receive JSON payloads
app.use(express.json())

app.get('/api/v1', (req, res) => {
  res.send('Runlog API v1 ✌️')
})

app.get('/api/v1/hello', (req, res) => {
  res.send('hello, stranger 👁️👄👁️')
})

/*
 *  RUN ROUTES
 */

// Retrieve the latest run activities from Strava for the logged in user.
app.get('/api/v1/strava/runs', authenticateToken, getStravaRuns)

// Get the routes for this user. Requires a JWT with the user's id in it.
app.get('/api/v1/runs', authenticateToken, (req, res) => {
  console.dir(req.user)

  res.json({
    runs: [
      {
        id: 1,
        date: '2020-12-18',
        userId: '',
        userName: 'Matt Bakken',
        distance: 7.55,
        distanceUnits: 'Miles'
      },

      {
        id: 2,
        date: '2020-12-19',
        userId: '',
        userName: 'Matt Bakken',
        distance: 8.17,
        distanceUnits: 'Miles'
      }
    ]
  })
})

/*
 *  LOGIN ROUTES
 */

// For now, there is no way to create a user account except via the database.
// See scripts/createUser.js

// This route is for providing user information to the client if they already have a JWT.
app.get('/api/v1/users/:userId', authenticateToken, getUserDetails)

// When a user logs in, we check their password against what was saved to the db.
app.post('/api/v1/users/login', login)

// After user authorizes Runlog to access their Strava data, this endpoint takes the access
// token and exchanges it for the user's access and refresh tokens for Strava API calls.
app.post('/api/v1/users/:userId/stravaCode/:stravaCode', authenticateToken, stravaCodeToTokens)

// Callback URL specified in scripts/createStravaWebhook.js
app.get('/api/v1/strava/webhook', stravaWebhookVerification)
app.post('/api/v1/strava/webhook', stravaWebhookHandler)

// TODO: We also need to start issuing JWTs when login is successful

app.listen(port, () => {
  console.log(`Magic happens at port ${port}`)
})
