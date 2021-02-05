import mongoose from 'mongoose'
import UserModel from '../db/UserModel.js'

// Returns more user fields to the client if they're already authenticated.
// This is useful for refreshing the user data on the client if it has recently changed.

const getUserDetails = (req, res) => {
  // Can't rely on the JWT for the user ID since some users can request OTHER user's records
  if (req.params.userId == null) {
    console.error('Unable to provide user details: userId missing in route params.')
    return res.sendStatus(400)
  }

  // Make sure the authenticated user is the one whose details are being requested
  if (req.user.id !== req.params.userId) {
    // TODO: allow admin users to skip this check
    console.error(`User with id "${req.user.id} is forbidden from accessing user details for user id: "${req.params.userId}"`)
    return res.sendStatus(403)
  }

  // Connect mongoose to the database
  mongoose.connect('mongodb://localhost/runlog', { useNewUrlParser: true, useUnifiedTopology: true })
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))

  try {
    db.once('open', async () => {
      // Look up user by email in mongo
      UserModel.findById(req.user.id, (err, user) => {
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

        db.close()
        return res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          hasFitbitAuth: user.hasFitbitAuth || false,
          hasStravaAuth: user.hasStravaAuth || false,
        })
      })
    })
  } catch (err) {
    console.error(err)
    db.close()
    return res.sendStatus(500)
  }
}

export default getUserDetails
