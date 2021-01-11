import {} from 'dotenv/config.js'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

// Databse Schema
import userSchema from './db/userSchema.js'

const app = express()
const port = 4000

// Only use CORS for dev environment
if (process.env.USE_CORS) {
  app.use(cors())
}

// Able to receive JSON payloads
app.use(express.json())

app.get('/api/v1', (req, res) => {
  res.send('Runlog API v1 ✌️')
})

app.get('/api/v1/hello', (req, res) => {
  res.send('hello, stranger 👁️👄👁️')
})

// Get the routes for this user. Requires a JWT with the user's id in it.
app.get('/api/v1/runs', authenticateToken, (req, res) => {
  console.dir(req.user)

  res.json({
    runs: [
      {
        id: 1,
        date: '2020-12-18',
        userId: '',
        userName: 'Matt Bakken',
        distance: 7.55,
        distanceUnits: 'Miles'
      },

      {
        id: 2,
        date: '2020-12-19',
        userId: '',
        userName: 'Matt Bakken',
        distance: 8.17,
        distanceUnits: 'Miles'
      }
    ]
  })
})

/*
 *  LOGIN ROUTES
 */

// For now, there is no way to create a user account except via the database.
// See scripts/createUser.js

function authenticateToken(req, res, next) {
  // Format of header: 'Bearer <token>'
  const authHeader = req.headers['authorization']

  console.log(authHeader)

  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
    return res.sendStatus(401)
  }

  console.log('Token:')
  console.log(JSON.stringify(token, null, 2))

  // Verify token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403)
    }

    req.user = user
    next()
  })
}

// This route is for providing user information to the client if they already have a JWT.
app.get('/api/v1/user', authenticateToken, (req, res) => {
  res.json({
    user: req.user
  })
})

// When a user logs in, we check their 
app.post('/api/v1/users/login', (req, res) => {
  
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
})

// TODO: We also need to start issuing JWTs when login is successful

app.listen(port, () => {
  console.log(`Magic happens at port ${port}`)
})
