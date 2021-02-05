import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import connectToMongo from '../db/connectToMongo.js'

// Databse Schema
import UserModel from '../db/UserModel.js'

const login = async (req, res) => {
  try {
    const db = await connectToMongo()
  
    // Look up user by email in mongo
    const user = await UserModel.findOne({ email: req.body.email })

    if (user == null) {
      console.error(`Cannot log in user: Unable to find user with email "${req.body.email}"`)
      db.close()
      return res.sendStatus(401)
    }

    // Check the password
    if (await bcrypt.compare(req.body.password, user.password)) {
      // Transform the user response from Mongoose into a plain object with only the public info
      // as visible fields
      const payload = {
        id: user._id,
        email: user.email,
        name: user.name,
        hasFitbitAuth: user.hasFitbitAuth || false,
        hasStravaAuth: user.hasStravaAuth || false,
      }

      // TODO: Generate JWT for public user data and send back as bearer token
      jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, null, (err, token) => {
        if (err) {
          console.error(err)
          db.close()
          return res.sendStatus(500)
        }

        db.close()
        return res.json({
          user: payload,
          accessToken: `Bearer ${token}`
        })
      })
    } else {
      // Bad password
      db.close()
      return res.sendStatus(401)
    }
  } catch (err) {
    console.error(err)
    return res.sendStatus(500)
  }
}

export default login
