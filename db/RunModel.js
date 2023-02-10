import mongoose from 'mongoose'

// This collection holds run documents that represent run activities on a user's
// third-party linked accounts like Strava, Fitbit, etc. 
const runSchema = new mongoose.Schema({
  userId: mongoose.ObjectId, // Runlog: 'user._id'
  name: String, // User can edit this field in Strava
  startDate: Date, // ISO 8601 w/ UTC tz
  startDateLocal: Date, // ISO 8601 w/ UTC tz but it's actually the local time. idk man.
  timezone: String, // This is not just an offset
  title: String, // Set based on the startDate and timezone. Can be modified by user.
  time: Number, // Strava: 'moving_time'
  distance: Number, // In meters
  averageSpeed: Number, // In meters per second
  totalElevationGain: Number, // In feet
  hasHeartRate: Boolean,
  averageHeartRate: Number,
  maxHeartRate: Number,
  deviceName: String,
  stravaActivityId: String, // Strava: 'id'
  stravaExternalId: String, // Strava: 'external_id', from Garmin or Fitbit, e.g.

  // TODO: Mongoose supports a point Schema that might work better here:
  // https://mongoosejs.com/docs/geojson.html
  startLatitude: Number,
  startLongitude: Number,

  // User editable fields
  results: { type: String, default: null },
  shoes: { type: String, default: null },
  ice: { type: Boolean, default: false},
  stretch: { type: Boolean, default: false},
  strength: { type: Boolean, default: false},

  shoeId: { type: mongoose.ObjectId, default: null },
})

export default mongoose.model('Runs', runSchema)
