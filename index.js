import {} from 'dotenv/config.js'
import express from 'express'
import cors from 'cors'
import logTimestamp from 'log-timestamp'

// Database
import connectToMongo from './db/connectToMongo.js'

// Utility functions
import sleep from './utils/sleep.js'

// Authentication
import authenticateToken from './auth/authenticateToken.js'
import login from './auth/login.js'
import stravaCodeToTokens from './auth/stravaCodeToTokens.js'
import stravaWebhookVerification from './auth/stravaWebhookVerification.js'
import stravaWebhookHandler from './auth/stravaWebhookHandler.js'

// Runs
import getAllRuns from './runs/getAllRuns.js'
import getRun from './runs/getRun.js'
import updateRun from './runs/updateRun.js'
import deleteRun from './runs/deleteRun.js'
import getStravaRuns from './runs/getStravaRuns.js'

// DailyStats
import getAllDailyStats from './dailyStats/getAllDailyStats.js'

// Training Plans
import getAllTrainingPlans from './training/getAllTrainingPlans.js'
import getTrainingPlan from './training/getTrainingPlan.js'
import createTrainingPlan from './training/createTrainingPlan.js'
import updateTrainingPlan from './training/updateTrainingPlan.js'
import updateTrainingPlanDate from './training/updateTrainingPlanDate.js'
import deleteTrainingPlan from './training/deleteTrainingPlan.js'

// Users
import getUserDetails from './users/getUserDetails.js'

// Shoes
import getShoes from './shoes/getShoes.js'
import createShoes from './shoes/createShoes.js'
import deleteShoes from './shoes/deleteShoes.js'

const app = express()
const port = 4000

logTimestamp() // Prepends timestamp to all console methods

// Only use CORS for dev environment
if (process.env.USE_CORS === 'true') {
  console.log('Using CORS')
  app.use(cors())
}

await connectToMongo()

// Able to receive JSON payloads
app.use(express.json())

// Simple request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`)
  next()
})

if (process.env.APP_ENV === 'dev') {
  app.use(async (req, res, next) => {
    await sleep(200)
    next()
  })
}

app.get('/api/v1', (req, res) => {
  res.send('Runlog API v1 ✌️')
})

app.get('/api/v1/hello', (req, res) => {
  res.send('hello, stranger 👁️👄👁️')
})

///////////////////////////////////////
// RUN ROUTES
///////////////////////////////////////

// Retrieve the latest run activities from Strava for the logged in user.
app.get('/api/v1/strava/runs', authenticateToken, getStravaRuns)

// Get one specific Runlog run object
app.get('/api/v1/runs/:id', authenticateToken, getRun)

// Get the Runlog runs for this user.
app.get('/api/v1/runs', authenticateToken, getAllRuns)

// Update the Runlog run object with any fields included in the message body
app.put('/api/v1/runs/:id', authenticateToken, updateRun)

// Delete the Runlog run object
app.delete('/api/v1/runs/:id', authenticateToken, deleteRun)

///////////////////////////////////////
// DAILY STATS ROUTES
///////////////////////////////////////

// Retrieve all daily stats documents for this user.
app.get('/api/v1/dailyStats', authenticateToken, getAllDailyStats)

///////////////////////////////////////
// TRAINING PLAN ROUTES
///////////////////////////////////////

// Create a new training plan for this user
app.post('/api/v1/training', authenticateToken, createTrainingPlan)

// Get one specific training plan object
app.get('/api/v1/training/:id', authenticateToken, getTrainingPlan)

// Get all training plans for this user
app.get('/api/v1/training', authenticateToken, getAllTrainingPlans)

// Update a specific date withing a training plan with any fields included in
// the message body
app.put(
  '/api/v1/training/:id/date/:dateISO',
  authenticateToken,
  updateTrainingPlanDate
)

// Update the training plan with any fields included in the message body
app.put('/api/v1/training/:id', authenticateToken, updateTrainingPlan)

// Delete the training plan with this specific ID
app.delete('/api/v1/training/:id', authenticateToken, deleteTrainingPlan)

///////////////////////////////////////
// LOGIN ROUTES
///////////////////////////////////////

// For now, there is no way to create a user account except via the database.
// See scripts/addUser.js

// This route is for providing user information to the client if they already
// have a JWT.
app.get('/api/v1/users/:id', authenticateToken, getUserDetails)

// When a user logs in, we check their password against what was saved to the db.
app.post('/api/v1/users/login', login)

///////////////////////////////////////
// SHOE ROUTES
// NB: Shoe mileage can only be updated when runs add a shoe to their list. See
// PUT /run/:id
///////////////////////////////////////

// Get the current user's shoes.
app.get('/api/v1/shoes', authenticateToken, getShoes)

// Create a new shoe for this user.
app.post('/api/v1/shoes', authenticateToken, createShoes)

// Delete shoes. This unlinks them from each run too.
app.delete('/api/v1/shoes/:id', authenticateToken, deleteShoes)

///////////////////////////////////////
// STRAVA AUTH AND API HANDLERS
///////////////////////////////////////

// After user authorizes Runlog to access their Strava data, this endpoint takes
// the access token and exchanges it for the user's access and refresh tokens
// for Strava API calls.
app.post(
  '/api/v1/users/:id/stravaCode/:stravaCode',
  authenticateToken,
  stravaCodeToTokens
)

// Callback URL specified in scripts/createStravaWebhook.js
app.get('/api/v1/strava/webhook', stravaWebhookVerification)
app.post('/api/v1/strava/webhook', stravaWebhookHandler)

// TODO: We also need to start issuing JWTs when login is successful

app.listen(port, () => {
  console.log(`Magic happens at port ${port}`)
})
