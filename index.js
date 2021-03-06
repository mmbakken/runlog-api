import {} from 'dotenv/config.js'
import express from 'express'
import cors from 'cors'
import { DateTime } from 'luxon'

// Database
import connectToMongo from './db/connectToMongo.js'

// Authentication
import authenticateToken from './auth/authenticateToken.js'
import login from './auth/login.js'
import stravaCodeToTokens from './auth/stravaCodeToTokens.js'
import stravaWebhookVerification from './auth/stravaWebhookVerification.js'
import stravaWebhookHandler from './auth/stravaWebhookHandler.js'
import getUserDetails from './auth/getUserDetails.js'

// Runs
import getAllRuns from './runs/getAllRuns.js'
import getRun from './runs/getRun.js'
import updateRun from './runs/updateRun.js'
import getStravaRuns from './runs/getStravaRuns.js'

const app = express()
const port = 4000

// Only use CORS for dev environment
if (process.env.USE_CORS === 'true') {
  console.log('Using CORS')
  app.use(cors())
}

connectToMongo()

// Able to receive JSON payloads
app.use(express.json())

// Simple request logging middleware
app.use((req, res, next) => {
  console.log(`${DateTime.utc().toString()} ${req.method} ${req.originalUrl}`)
  next()
})

app.get('/api/v1', (req, res) => {
  res.send('Runlog API v1 ✌️')
})

app.get('/api/v1/hello', (req, res) => {
  res.send('hello, stranger 👁️👄👁️')
})


// RUN ROUTES

// Retrieve the latest run activities from Strava for the logged in user.
app.get('/api/v1/strava/runs', authenticateToken, getStravaRuns)

// Get one specific Runlog run object
app.get('/api/v1/runs/:runId', authenticateToken, getRun)

// Get the Runlog runs for this user.
app.get('/api/v1/runs', authenticateToken, getAllRuns)

// Update the Runlog run object with any fields included in the message body
app.put('/api/v1/runs/:runId', authenticateToken, updateRun)


// LOGIN ROUTES

// For now, there is no way to create a user account except via the database.
// See scripts/createUser.js

// This route is for providing user information to the client if they already have a JWT.
app.get('/api/v1/users/:userId', authenticateToken, getUserDetails)

// When a user logs in, we check their password against what was saved to the db.
app.post('/api/v1/users/login', login)


// STRAVA AUTH AND API HANDLERS

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
