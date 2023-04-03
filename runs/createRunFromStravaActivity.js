import RunModel from '../db/RunModel.js'

import generateTitle from './generateTitle.js'
import updateDailyStats from '../dailyStats/updateDailyStats.js'
import updatePlansFromRun from './updatePlansFromRun.js'

// This function will create a new Run document based on the Strava activity provided.
//
// If a run already exists with this Strava activity id, no attempt to update the Run will be made.
//
// A DailyStats object for the date of this run may also be created or if that date already has a
// DailyStats document, it will be updated as necessary. All DailyStats with weekly and sevenDay
// distance totals within 6 days will be updated as well (as relevant).
//
// Any training plans for this user that include the run date will have their actualDistance fields
// updated appropriately (plan, week, date)
const createRunFromStravaActivity = async (user, activity) => {
  try {
    const runExists = await RunModel.exists({ stravaActivityId: activity.id })

    // Make sure we want to track it
    if (activity.type !== 'Run') {
      console.log('Activity was not a run, disregard this one.')
      return
    }

    // Only add to db if this is a new activity
    if (!runExists) {
      // Format should be like '(GMT-08:00) America/Denver', luxon wants just the latter half
      const tz = activity.timezone.split(' ')[1]

      const newRun = await RunModel.create({
        userId: user._id,
        name: activity.name,
        startDate: activity.start_date,
        startDateLocal: activity.start_date_local,
        timezone: activity.timezone,
        time: activity.moving_time,
        title: generateTitle(activity.start_date, tz),
        distance: activity.distance,
        averageSpeed: activity.average_speed,
        totalElevationGain: activity.total_elevation_gain,
        hasHeartRate: activity.has_heartrate,
        averageHeartRate: activity.average_heartrate,
        maxHeartRate: activity.max_heartrate,
        deviceName: activity.device_name,
        stravaActivityId: activity.id,
        stravaExternalId: activity.external_id,
        startLatitude: activity?.start_latlng[0],
        startLongitude: activity?.start_latlng[1],
      })

      console.log(`New run created successfully. Runlog Id: "${newRun._id}", Strava activityId: "${activity.id}"`)

      // A new run means daily totals have changed. Update them appropriately.
      await updateDailyStats(newRun, user)

      // Update all of the plans that include this run
      await updatePlansFromRun(newRun, user._id.toString())

      return
    } else {
      console.log('Strava Activity already exists as a Run document. Will not add a duplicate.')
      return
    }
  } catch (err) {
    console.error(err)
  }
}

export default createRunFromStravaActivity
