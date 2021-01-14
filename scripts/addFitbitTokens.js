import mongoose from 'mongoose'
import userSchema from '../db/userSchema.js'

// Adds a Fitbit Access Token and Refresh Token pair to an existing user record

/*
  COPY USER AND AUTHENTICATION INFO HERE
*/
const userEmail = 'mmbakken@gmail.com'
const accessToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMkM2UVEiLCJzdWIiOiI2OE5XVjgiLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJyc2V0IHJhY3QgcmxvYyByd2VpIHJociBycHJvIiwiZXhwIjoxNjEwNjg2OTc1LCJpYXQiOjE2MTA2NTgxNzV9.t4w2U_4pFDFgNoKKgHbYTCCNgj9yc-Vw61YG7QkMOyg'
const refreshToken = 'c22d90d202d7a8a1448dc014d30859303a543f634b95aee29e7650cacf453aed'

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
 
     await user.save()
 
     db.close()
   })
 } catch (err) {
   console.error(err)
   db.close()
 }
