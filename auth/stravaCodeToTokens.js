import {} from 'dotenv/config.js'
import axios from 'axios'
import qs from 'qs'
import UserModel from '../db/UserModel.js'

const stravaCodeToTokens = async (req, res) => {
  const userId = req.params.userId
  const stravaCode = req.params.stravaCode

  if (userId == null || stravaCode == null) {
    res.sendStatus(400)
  }

  try {
    const user = await UserModel.findById(userId)

    if (user == null) {
      console.error(`Unable to complete Strava code/token exchange: Unable to find user with id "${userId}"`)
      return res.sendStatus(400)
    }

    // Set up auth params
    // Runlog.dev Strava API settings: https://www.strava.com/settings/api
    // Log in with your personal Strava account to view.
    const clientId = process.env.STRAVA_CLIENT_ID
    const clientSecret = process.env.STRAVA_CLIENT_SECRET

    const response = await axios({
      method: 'post',
      url: 'https://www.strava.com/oauth/token',
      data: qs.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: stravaCode,
        grant_type: 'authorization_code',
      })
    })

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
    return res.sendStatus(200)
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
}

export default stravaCodeToTokens
