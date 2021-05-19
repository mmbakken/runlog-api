import mongoose from 'mongoose'

// This collection holds run documents that represent run activities on a user's
// third-party linked accounts like Strava, Fitbit, etc. 
const runSchema = new mongoose.Schema({
  userId: mongoose.ObjectId, // Runlog: 'user._id'
  name: String, // User can edit this field in Strava
  startDate: Date, // ISO 8601 w/ UTC tz
  startDateLocal: Date, // ISO 8601 w/ UTC tz but it's actually the local time. idk man.
  timezone: String, // This is not just an offset
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
  shoes: { type: String, default: null },
  ice: { type: Boolean, default: false},
  stretch: { type: Boolean, default: false},
  strength: { type: String, default: null},
  results: { type: String, default: null },
 
  // TODO: Retrieve these fields in a separate call, not part of the bulk import
  // Fields that have to be retrieved from Strava's get activity details endpoint
  // GET /activity/:id
//   calories: Number, // TODO: Is this used for run activities?
//   description: String, // From Strava; Need to decide if "comments" is the same
//   laps: [], // TODO: lap data might get big; think about this more.
// 
//   // Runlog-added fields
//   comments: String,
//   strengthComments: String,
//   didStretch: Boolean,
//   didIce: Boolean,
})

export default mongoose.model('Runs', runSchema)