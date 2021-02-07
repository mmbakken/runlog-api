import axios from 'axios'
import qs from 'qs'
import { DateTime } from 'luxon'

// Strava API wrapper for refreshing the token. Will always call the Strava API.
const refreshStravaTokens = async (refreshToken) => {
    if (refreshToken == null) {
      throw new Error('refreshStravaTokens requires a refreshToken')
    }

    // Runlog.dev Strava API settings: https://www.strava.com/settings/api
    // Log in with your personal Strava account to view.
    const clientId = process.env.STRAVA_CLIENT_ID
    const clientSecret = process.env.STRAVA_CLIENT_SECRET

    try {
      const response = await axios({
        method: 'post',
        url: 'https://www.strava.com/api/v3/oauth/token',
        data: qs.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        })
      })

      console.log('Response from Strava Refresh Tokens endpoint:')
      console.dir(response.data)

      return {
        stravaAccessToken: response.data.access_token,
        stravaRefreshToken: response.data.refresh_token,
        stravaTokenExpiresAt: response.data.expires_at,
      }
    } catch (error) {
      console.error('Response from Strava Refresh Tokens endpoint was an error:')
      console.error(error.toJSON())
      throw error
    }
}

// Will refresh the Strava access token, refresh token, and expiration timestamp if they
// are close to the expiry date and return the new values.
const useFreshTokens = async (user) => {
  if (user == null) {
    throw new Error('useFreshTokens requires a Mongoose user instance.')
  }

  // Required fields
  if (
    user.stravaRefreshToken == null ||
    user.stravaTokenExpiresAt == null
  ) {
    throw new Error('useFreshTokens requires user instance to have non-empty values for stravaRefreshToken, stravaTokenExpiresAt')
  }

  const expiresAt = DateTime.fromISO(user.stravaTokenExpiresAt.toISOString()).toUTC()
  const soon = DateTime.utc().plus({ minutes: 10 })

  console.log(`Token expires at: ${expiresAt}`)

  // Check the expiration date. If it's in the next 10 minutes, refresh the tokens
  if (user.stravaTokenExpiresAt < soon) {
    console.log('Refreshing tokens')

    const newTokens = await refreshStravaTokens(user.stravaRefreshToken)
    console.error('Error occured in refreshStravaTokens')

    // Update the user token values
    user.stravaAccessToken = newTokens.stravaAccessToken,
    user.stravaRefreshToken = newTokens.stravaRefreshToken,

    // Response is a Unix epoch timestamp, in seconds. Convert to ms for Javascript's
    // Date timestamp to represent the same moment.
    user.stravaTokenExpiresAt = parseInt(newTokens.stravaTokenExpiresAt) * 1000

    await user.save()
    return newTokens.stravaAccessToken
  } else {
    console.log('Skipping token refresh')
    return user.stravaAccessToken
  }
}

export { useFreshTokens, refreshStravaTokens }
