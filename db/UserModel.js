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

  stats: {
    // TODO: Make this editable from a user settings page
    // See Luxon's DateTtime.weekday()
    // 1 => Monday, 7 => Sunday
    weekStartsOn: { type: Number, default: 1, min: 1, max: 7 },
  },
})

export default mongoose.model('Users', userSchema)
