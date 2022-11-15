import mongoose from 'mongoose'

// This collection holds plan documents that represent user's planned workouts/mileage for a set
// period of time. It allows the user to plan thier training over weeks or seasons in one view.
const trainingSchema = new mongoose.Schema({
  userId: mongoose.ObjectId, // Runlog: 'user._id'
  startDate: Date, // ISO 8601, like 2022-03-29
  endDate: Date, // ISO 8601, like 2022-03-29
  timezone: String, // This is not just an offset
  title: String, // User-defined name, required to create a new training plan
  goal: String, // Allows the user to keep their aspirations in view while reviewing training plan
  isActive: {  // Is this plan the one the user is currently following?
    type: Boolean,
    default: false,
  },
  
  // Plan-wide distance totals
  actualDistance: Number, // Meters; Sum of all run distances that have actually happened in this plan period
  plannedDistance: Number, // Miles; Sum of all user-entered mileage amounts in this plan period
  plannedDistanceMeters: Number, // Meters; Sum of all user-entered mileage amounts in this plan period (used to compare with actualDistance fields)

  // Week-specific distance totals
  weeks: [{
    startDateISO: String, // ISO 8601, like 2022-03-29 TODO: Should this be a Date instead?
    actualDistance: Number, // Meters; Sum of all run distances that have actually happened in this week
    plannedDistance: Number, // Miles; Sum of all user-entered mileage amounts in this week
    plannedDistanceMeters: Number, // Meters; Sum of all user-entered mileage amounts in this week (used to compare with actualDistance fields)
  }],

  // These objects are the basis of the Calendar section. They allow the user to see daily distance
  // totals, workout descriptions, and workout categories
  dates: [{
    dateISO: Date, // ISO 8601, like 2022-03-29 TODO: Should this just be a string?
    actualDistance: Number, // Meters; Sum of all run distances that have actually happened on this date for this user
    plannedDistance: Number, // Miles; The user-entered mileage amount they plan to run on this date.
    plannedDistanceMeters: Number, // Meters; The user-entered mileage amount they plan to run on this date (used to compare with actualDistance fields)
    workout: String, // Text description of this workout.
    workoutCategory: Number, // Index of the category enum, see runlog-api/constants/workoutCategories.js
  }],

  // The journal is a section of the training plan where the user can add text comments about their
  // progress, specific workouts, injury status, etc.
  journal: [{
    timestamp: Date,
    content: String,
    // TODO: Add references to specific dates or weeks?
  }],
})

export default mongoose.model('Plans', trainingSchema)
