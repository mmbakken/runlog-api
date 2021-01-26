import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  fitbitAccessToken: String,
  fitbitRefreshToken: String,
  fitbitUserId: String,
  hasFitbitAuth: Boolean,
  stravaAccessToken: String,
  stravaRefreshToken: String,
  stravaTokenExpiresAt: Date,
  stravaUserId: String, // AKA Athlete ID
  hasStravaAuth: Boolean,
})

export default userSchema
