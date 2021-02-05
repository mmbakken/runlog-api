import axios from 'axios'
import qs from 'qs'
import { DateTime } from 'luxon'

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
      console.log('Token refresh successful.')
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

    console.log(`Token expires at: ${expiresAt}`)

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

export { useFreshTokens, refreshStravaTokens }
