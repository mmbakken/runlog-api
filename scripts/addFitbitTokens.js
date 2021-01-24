import mongoose from 'mongoose'
import userSchema from '../db/userSchema.js'

// Adds a Fitbit Access Token and Refresh Token pair to an existing user record

/*
  COPY USER AND AUTHENTICATION INFO HERE
*/
const userEmail = 'mmbakken@gmail.com'
const accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMkM2UVEiLCJzdWIiOiI2OE5XVjgiLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJyYWN0IHJzZXQgcmxvYyByd2VpIHJociBycHJvIiwiZXhwIjoxNjEwNzcyNjEwLCJpYXQiOjE2MTA3NDM4MTB9.8TAqztRuzbup5HLQYFboEvnXk0p2ofYGX8hh5S9v5OM'
const refreshToken = '1ce4bc80b5a1b848ef4b8531f00ce40ce5c50c7e3e3455b87b2221a149ce1444'
const userId = '68NWV8'

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
 
     console.log('Adding tokens to user record')
     user.fitbitAccessToken = accessToken
     user.fitbitRefreshToken = refreshToken
     user.fitbitUserId = userId
 
     await user.save()
 
     db.close()
   })
 } catch (err) {
   console.error(err)
   db.close()
 }
