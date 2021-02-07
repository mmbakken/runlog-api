import {} from 'dotenv/config.js'
import connectToMongo from './db/connectToMongo.js'
import axios from 'axios'
import qs from 'qs'
import UserModel from '../db/UserModel.js'

// This script will exchange the refresh token for a new access token and refresh token
// pair from the Fitbit OAuth2 API

const refreshFitbitTokens = async () => {
  if (process.argv.length !== 3 || process.argv[2] == null) {
    console.log('Usage: $ node scripts/refreshFitbitTokens.js <userEmail>')
    return -1
  }

  const userEmail = process.argv[2]

  connectToMongo()

  try {
    const user = await UserModel.findOne({ email: userEmail })

    if (user == null) {
      console.error(`No existing user with email "${userEmail}"`)
      return -1
    }

    // Use the refresh token to get a new token pair
    // See: https://dev.fitbit.com/build/reference/web-api/oauth2/#refreshing-tokens

    // Set up auth params
    // Runlog.dev Fitbit API settings: https://dev.fitbit.com/apps/details/22C6QQ
    const clientId = '22C6QQ'
    const clientSecret = process.env.FITBIT_CLIENT_SECRET
    const basicAuthPassword = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await axios({
      method: 'post',
      url: 'https://api.fitbit.com/oauth2/token',
      data: qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: user.fitbitRefreshToken,
      }),
      headers: {
        'Authorization': `Basic ${basicAuthPassword.toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    console.log('Token refreshed successfully')

    user.fitbitAccessToken = response.data.access_token
    user.fitbitRefreshToken = response.data.refresh_token

    await user.save()
  } catch (err) {
    console.error(err)
  }
}

refreshFitbitTokens()
