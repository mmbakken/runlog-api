import {} from 'dotenv/config.js'
import axios from 'axios'
import { DateTime } from 'luxon'
import connectToMongo from '../db/connectToMongo.js'
import UserModel from '../db/UserModel.js'

// This script will retrieve a list of activity objects from the Fitbit API.
// See: https://dev.fitbit.com/build/reference/web-api/activity/#get-activity-logs-list
// Also: https://dev.fitbit.com/build/reference/web-api/oauth2/#making-requests

const getFitbitActivities = async () => {
  if (process.argv.length !== 3 || process.argv[2] == null) {
    console.log('Usage: $ node scripts/getFitbitActivities.js <userEmail>')
    return -1
  }

  const userEmail = process.argv[2]

  connectToMongo()

  // Only allow beforeDate XOR afterDate. The 'sort' value is determined by which date
  // you decide to use. See Fitbit API docs for param restrictions.
  const beforeDate = DateTime.utc().plus({ days: 1 }).toISODate()
  const afterDate = null

  const limit = 20 // 20 is the maximum number of results returned by the Fitbit API
  const params = {
    beforeDate: beforeDate,
    sort: 'desc',
    limit: limit,
    offset: 0,
  }

  // Validate date params
  if (beforeDate == null && afterDate == null) {
    console.error('beforeDate XOR afterDate must be non-null. Please set exactly one of these values and try again.')
    return -1
  }

  // User wants to send the afterDate param instead
  if (beforeDate == null && afterDate != null) {
    params.afterDate = afterDate
    params.sort = 'asc'
    delete params.beforeDate
  }

  try {
    const user = await UserModel.findOne({ email: userEmail })

    if (user == null) {
      console.error(`No existing user with email "${userEmail}"`)
      return
    }

    console.log('Get Activities List')
    console.log('Params:')
    console.log(JSON.stringify(params, null, 2))

    const response = await axios({
      method: 'get',
      url: `https://api.fitbit.com/1/user/${user.fitbitUserId}/activities/list.json`,
      params: params,
      headers: {
        'Authorization': `Bearer ${user.fitbitAccessToken}`,
        'Accept-Language': 'en-US',
      },
    })

    console.log('Fitbit activities retrieved successfully')
    console.dir(response.data)
  } catch (err) {
    console.error(err)
  }
}

getFitbitActivities()
