import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  fitbitAccessToken: String,
  fitbitRefreshToken: String,
  fitbitUserId: String,
  stravaAccessToken: String,
  stravaRefreshToken: String,
  stravaTokenExpiresAt: Date,
  stravaUserId: String, // AKA Athlete ID
})

export default userSchema
