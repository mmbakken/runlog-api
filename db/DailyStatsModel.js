import mongoose from 'mongoose'

// This collection holds run documents that represent run activities on a user's
// third-party linked accounts like Strava, Fitbit, etc. 
const dailyStatsSchema = new mongoose.Schema({
  userId: { type: mongoose.ObjectId, default: null }, // Runlog: 'user._id'
  date: {
    type: Date, // ISO-8601 date format like 'yyyy-mm-dd'
    default: null,
    required: true,
  },
  title: { type: String },
  runIds: [{ type: mongoose.ObjectId }],
  distance: { type: Number, default: 0 }, // Total of the distances of each run in runIds (in meters)
  sevenDayDistance: { type: Number, default: 0 }, // The running total of distance today + previous 6 days (in meters)
  weeklyDistance: { type: Number, default: 0 }, // The running total of distance since this week began (in meters)
})

export default mongoose.model('dailyStats', dailyStatsSchema)
