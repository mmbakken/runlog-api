import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

// Databse Schema
import userSchema from '../db/userSchema.js'

const login = (req, res) => {
  // Connect mongoose to the database
  mongoose.connect('mongodb://localhost/runlog', {useNewUrlParser: true})
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))

  try {
    db.once('open', async () => {
      const User = mongoose.model('User', userSchema)

      // Look up user by email in mongo
      User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
          console.error(err)
          db.close()
          return res.sendStatus(500)
        }

        if (user == null) {
          console.error(`Cannot log in user: Unable to find user with email "${req.body.email}"`)
          db.close()
          return res.sendStatus(403)
        }

        console.log('User:')
        console.log(user.inspect())

        // Check the password
        bcrypt.compare(req.body.password, user.password).then((isValid) => {
          if (isValid) {
            // Transform the user response from Mongoose into a plain object with only the public info
            // as visible fields
            const payload = {
              id: user._id,
              email: user.email,
              name: user.name,
            }

            // TODO: Generate JWT for public user data and send back as bearer token
            jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, null, (err, token) => {
              if (err) {
                console.error(err)
                db.close()
                return res.sendStatus(500)
              }

              db.close()
              res.json({
                user: payload,
                accessToken: `Bearer ${token}`
              })
            })
          } else {
            // Bad password
            db.close()
            res.sendStatus(401)
          }
        }).catch((err) => {
          console.error(err)
          db.close
          res.sendStatus(500)
        })
      })
    })
  } catch (err) {
    console.error(err)
    db.close()
  }
}

export default login
