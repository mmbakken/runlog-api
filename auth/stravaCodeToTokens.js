import {} from 'dotenv/config.js'
import mongoose from 'mongoose'
import axios from 'axios'
import qs from 'qs'
import userSchema from '../db/userSchema.js'

const stravaCodeToTokens = (req, res) => {
  const userId = req.params.userId
  const stravaCode = req.params.stravaCode

  if (userId == null || stravaCode == null) {
    res.sendStatus(400)
  }

  // Connect mongoose to the database
  mongoose.connect('mongodb://localhost/runlog', { useNewUrlParser: true, useUnifiedTopology: true })
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))

  try {
    db.once('open', async () => {
      const User = mongoose.model('User', userSchema)

      // Look up user by email in mongo
      User.findById(userId, (err, user) => {
        if (err) {
          console.error(err)
          db.close()
          return res.sendStatus(500)
        }

        if (user == null) {
          console.error(`Unable to complete Strava code/token exchange: Unable to find user with id "${userId}"`)
          db.close()
          return res.sendStatus(400)
        }

        // Set up auth params
        // Runlog.dev Strava API settings: https://www.strava.com/settings/api
        // Log in with your personal Strava account to view.
        const clientId = process.env.STRAVA_CLIENT_ID
        const clientSecret = process.env.STRAVA_CLIENT_SECRET

        axios({
          method: 'post',
          url: 'https://www.strava.com/oauth/token',
          data: qs.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code: stravaCode,
            grant_type: 'authorization_code',
          })
        }).then(async (response) => {
          console.log(`Linking Strava account for user "${user.email}"`)
          console.log(`Strava Athlete ID: ${response.data.athlete.id}`)

          user.stravaAccessToken = response.data.access_token
          user.stravaRefreshToken = response.data.refresh_token 
          user.stravaUserId = response.data.athlete.id
          user.hasStravaAuth = true

          // Response is a Unix epoch timestamp, in seconds. Convert to ms for Javascript's
          // Date timestamp to represent the same moment.
          user.stravaTokenExpiresAt = parseInt(response.data.expires_at) * 1000

          await user.save()
          db.close()
          return res.sendStatus(200)
        }).catch((error) => {
          console.error(error.toJSON())
          db.close()
          return res.sendStatus(500)
        })
      })
    })
  } catch (err) {
    console.error(err)
    db.close()
    return res.sendStatus(500)
  }
}

export default stravaCodeToTokens
