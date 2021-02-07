import axios from 'axios'
import UserModel from '../db/UserModel.js'
import { useFreshTokens } from '../auth/stravaTokens.js'

const getStravaRuns = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id)

    if (user == null) {
      console.error(`Unable to find user with id "${req.user.id}"`)
      return res.sendStatus(400)
    }

    const response = await axios({
      method: 'get',
      url: 'https://www.strava.com/api/v3/athlete/activities',
      headers: {
        Authorization: `Bearer ${await useFreshTokens(user)}`,
      }
    })

    console.log('Retrieved Strava activities successfully')

    // TODO: Eventually, we can import these runs into our database for this user.
    return res.json(response.data)
  } catch (err) {
    console.error(err)
    return res.sendStatus(500)
  }
}

export default getStravaRuns
