import {} from 'dotenv/config.js'
import mongoose from 'mongoose'
import axios from 'axios'
import qs from 'qs'
import { DateTime } from 'luxon'
import userSchema from '../db/userSchema.js'

// This script will retrieve a list of activity JSON objects from the Fitbit API.
// See: https://dev.fitbit.com/build/reference/web-api/activity/#get-activity-logs-list
// Also: https://dev.fitbit.com/build/reference/web-api/oauth2/#making-requests

/*
  COPY USER INFO HERE
*/
const userEmail = 'mmbakken@gmail.com'

// Get most recent activities
// TODO: When this becomes part of the app, allow afterDate XOR beforeDate
const beforeDate = DateTime.utc().plus({ days: 1 }).toISODate()
const afterDate = null
const limit = 20 // Maximum number of results returned by Fitbit API

// Connect mongoose to the database
mongoose.connect('mongodb://localhost/runlog', {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

try {
  db.once('open', async () => {
    const Users = mongoose.model('User', userSchema)

    const user = await Users.findOne({ email: userEmail })

    if (user == null) {
      console.error(`No existing user with email "${userEmail}"`)
      db.close()
      return
    }

    const params = {
      beforeDate: beforeDate,
      sort: 'desc',
      limit: limit,
      offset: 0,
    }

    if (beforeDate == null) {
      params.afterDate = afterDate
      params.sort = 'asc'
      delete params.beforeDate
    }

    console.log('Get Activities List')
    console.log('Params:')
    console.log(JSON.stringify(params, null, 2))

    axios({
      method: 'get',
      url: `https://api.fitbit.com/1/user/${user.fitbitUserId}/activities/list.json`,
      params: params,
      headers: {
        'Authorization': `Bearer ${user.fitbitAccessToken}`,
        'Accept-Language': 'en-US',
      },
    }).then(async (response) => {
      console.log('Fitbit activities retrieved successfully')
      console.dir(response.data)

      db.close()
    }).catch((error) => {
      console.error(error.toJSON())
      db.close()
      return
    })
  })
} catch (err) {
  console.error(err)
  db.close()
}
