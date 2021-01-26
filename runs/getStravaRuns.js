import { DateTime } from 'luxon'
import axios from 'axios'
import qs from 'qs'
import mongoose from 'mongoose'
import userSchema from '../db/userSchema.js'

// Strava API wrapper for refreshing the token. Will always call the Strava API.
const refreshStravaTokens = (refreshToken) => {
  return new Promise((resolve, reject) => {
    if (refreshToken == null) {
      return reject(new Error('refreshStravaTokens requires a refreshToken'))
    }

    // Runlog.dev Strava API settings: https://www.strava.com/settings/api
    // Log in with your personal Strava account to view.
    const clientId = process.env.STRAVA_CLIENT_ID
    const clientSecret = process.env.STRAVA_CLIENT_SECRET

    axios({
      method: 'post',
      url: 'https://www.strava.com/api/v3/oauth/token',
      data: qs.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      })
    }).then((response) => {
      console.log('Response from refresh token endpoint:')
      console.dir(response.data)

      resolve({
        stravaAccessToken: response.data.access_token,
        stravaRefreshToken: response.data.refresh_token,
        stravaTokenExpiresAt: response.data.expires_at,
      })
    }).catch((error) => {
      reject(error)
    })
  })
}

// Will refresh the Strava access token, refresh token, and expiration timestamp if they
// are close to the expiry date and return the new values.
const useFreshTokens = (user) => {
  return new Promise((resolve, reject) => {
    if (user == null) {
      return reject(new Error('useFreshTokens requires a Mongoose user instance.'))
    }

    // Required fields
    if (
      user.stravaRefreshToken == null ||
      user.stravaTokenExpiresAt == null
    ) {
      return reject(new Error('useFreshTokens requires user instance to have non-empty values for stravaRefreshToken, stravaTokenExpiresAt'))
    }

    const expiresAt = DateTime.fromISO(user.stravaTokenExpiresAt.toISOString()).toUTC()
    const soon = DateTime.utc().plus({ minutes: 10 })

    console.log(`Current Strava access token is: "${user.stravaAccessToken}"`)
    console.log(`Token expires at: ${expiresAt}`)
    console.log(`Refresh token if it expires before: ${soon}`)

    // Check the expiration date. If it's in the next 10 minutes, refresh the tokens
    if (user.stravaTokenExpiresAt < soon) {
      refreshStravaTokens(user.stravaRefreshToken).then((newTokenData) => {

        // Update the user token values
        user.stravaAccessToken = newTokenData.stravaAccessToken,
        user.stravaRefreshToken = newTokenData.stravaRefreshToken,

        // Response is a Unix epoch timestamp, in seconds. Convert to ms for Javascript's
        // Date timestamp to represent the same moment.
        user.stravaTokenExpiresAt = parseInt(newTokenData.stravaTokenExpiresAt) * 1000

        user.save().then((updatedUser) => {
          return resolve(updatedUser.stravaAccessToken)
        }).catch((err) => {
          return reject(err)
        })
      }).catch((error) => {
        return reject(error)
      })
    } else {
      console.log('Skipping token refresh')
      return resolve(user.stravaAccessToken)
    }
  })
}

const getStravaRuns = (req, res) => {
  // Connect mongoose to the database
  mongoose.connect('mongodb://localhost/runlog', { useNewUrlParser: true, useUnifiedTopology: true })
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))

  try {
    db.once('open', async () => {
      const User = mongoose.model('User', userSchema)

      // Look up user in mongo
      User.findById(req.user.id, async (err, user) => {
        if (err) {
          console.error(err)
          db.close()
          return res.sendStatus(500)
        }

        if (user == null) {
          console.error(`Unable to find user with id "${req.user.id}"`)
          db.close()
          return res.sendStatus(400)
        }

        // Refresh the token if needed
        useFreshTokens(user).then((freshAccessToken) => {
          //const now = DateTime.utc().plus({ minutes: '1' }).toISODate()

          // Now that we know we have a good access token, make the request to Strava
          axios({
            method: 'get',
            url: 'https://www.strava.com/api/v3/athlete/activities',
             // data: qs.stringify({
             //   before: now
             // }),
            headers: {
              Authorization: `Bearer ${freshAccessToken}`,
            }
          }).then((response) => {
            console.log('Retrieved Strava activities:')

            db.close()

            // TODO: Eventually, we can import these runs into our database for this user.
            return res.json(response.data)
          }).catch((error) => {
            console.error(error.toJSON())
            db.close()
            return res.sendStatus(500)
          })
        }).catch((err) => {
          console.log('Something went wrong somewhere in useFreshTokens:')
          console.error(err.toJSON())
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

export default getStravaRuns
