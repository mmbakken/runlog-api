import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,

  // Fitbit Auth
  fitbitAccessToken: String,
  fitbitRefreshToken: String,
  fitbitUserId: String,
  hasFitbitAuth: Boolean,

  // Strava Auth
  stravaAccessToken: String,
  stravaRefreshToken: String,
  stravaTokenExpiresAt: Date,
  stravaUserId: String, // Strava: athlete.id
  hasStravaAuth: Boolean,
})

export default mongoose.model('Users', userSchema)
