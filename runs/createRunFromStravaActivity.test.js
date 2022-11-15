import mongoose from 'mongoose'
import TrainingModel from '../db/TrainingModel.js'
import RunModel from '../db/RunModel.js'
import UserModel from '../db/UserModel.js'
import { jest, describe, expect, beforeAll, beforeEach, afterEach, afterAll, test } from '@jest/globals'

import createRunFromStravaActivity from './createRunFromStravaActivity.js'

beforeAll(async () => {
  // Set up test DB
  try {
    await mongoose.connect('mongodb://localhost/runs', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  } catch (err) {
    console.error('Failed to connect to Mongoose')
    console.dir(err)
  }
})

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {}) // Ignores console.log, keeps others
})

afterEach(async () => {
  // Clean out the db after each test run
  await TrainingModel.deleteMany()
  await UserModel.deleteMany()
  await RunModel.deleteMany()
})

afterAll(async () => {
  // Tear down test DB
  return await mongoose.connection.close()
})

describe('Run creation', () => {
  test('Creates a new Run document from Strava activity JSON', async () => {
    const user = await UserModel.create({
      name: 'Vlad',
      email: 'lenin@gmail.com'
    })

    // See: https://developers.strava.com/docs/reference/#api-Activities-getActivityById
    const stravaActivity = {
      id: 12345678987654321,
      type: 'Run',
      name: 'Morning Run',
      start_date: '2022-10-10T23:07:39Z',
      start_date_local: '2022-10-10T17:07:39Z',
      timezone: '(GMT-08:00) America/Denver',
      moving_time: 4207,
      distance: 28099,
      average_speed: 6.679,
      total_elevation_gain: 100,
      has_heartrate: true,
      average_heartrate: 145,
      max_heartrate: 160,
      device_name: 'Garmin Forerunner 945',
      external_id: 'garmin_push_12345678987654321',
      start_latlng: [ 37.83, -122.26 ],
    }

    await createRunFromStravaActivity(user, stravaActivity)

    const runs = await RunModel.find({}).exec()
    expect(runs.length).toBe(1)
  })

  test('Updates the existing training plan\'s actualDistance fields correctly when a new run is created from Strava', async () => {
    const user = await UserModel.create({
      name: 'Vlad',
      email: 'lenin@gmail.com'
    })

    // Create some runs that exist prior to the creation of the next run
    await RunModel.create({
      userId: user._id,
      name: 'Test Run 1',
      startDate: new Date('2022-10-10T23:07:39Z'), // first day of plan
      startDateLocal: new Date('2022-10-10T17:07:39Z'),
      timezone: '(GMT-06:00) America/Chicago',
      distance: 1609.34, // 1 mile, in meters
    })
    await RunModel.create({
      userId: user._id,
      name: 'Test Run 2',
      startDate: new Date('2022-10-16T23:07:39Z'),
      startDateLocal: new Date('2022-10-16T17:07:39Z'),
      timezone: '(GMT-06:00) America/Chicago',
      distance: 1609.34, // 1 mile, in meters
    })

    // Create a plan that includes these runs
    await TrainingModel.create({
      userId: user._id,
      startDate: '2022-10-10',
      endDate: '2022-10-23',
      timezone: 'America/Denver',
      title: 'Training Plan 2 Weeks',
      goal: 'Create training plans without bugs :)',
      isActive: true,
      actualDistance: 3218.68, // 2 miles, in meters
      plannedDistance: 0,
      plannedDistanceMeters: 0,
      weeks: [
      {
        startDateISO: '2022-10-10',
        actualDistance: 3218.68, // 2 miles, in meters
        plannedDistance: 0,
        plannedDistanceMeters: 0,
      },
      {
        startDateISO: '2022-10-17',
        actualDistance: 0,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
      }
      ],
      dates: [
        {
          dateISO: '2022-10-10',
          actualDistance: 1609.34, // 1 mile, in meters
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-11',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-12',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-13',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-14',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-15',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-16',
          actualDistance: 1609.34, // 1 mile, in meters
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-17',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-18',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-19',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-20',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-21',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-22',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-23',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
      ],
      journal: []
    })

    // Add a new run via the Strava webhook whose distance SHOULD be added to this plan
    // See: https://developers.strava.com/docs/reference/#api-Activities-getActivityById
    const stravaActivity = {
      id: 12345678987654321,
      type: 'Run',
      name: 'Morning Run',
      start_date: '2022-10-17T23:07:39Z',
      start_date_local: '2022-10-17T17:07:39Z',
      timezone: '(GMT-08:00) America/Denver',
      moving_time: 4207,
      distance: 1609.34, // 1 mile, in meters
      average_speed: 6.679,
      total_elevation_gain: 100,
      has_heartrate: true,
      average_heartrate: 145,
      max_heartrate: 160,
      device_name: 'Garmin Forerunner 945',
      external_id: 'garmin_push_12345678987654321',
      start_latlng: [ 37.83, -122.26 ],
    }

    await createRunFromStravaActivity(user, stravaActivity)
    const plan = await TrainingModel.findOne({}).exec()

    expect(plan.actualDistance).toBe(4828.02) // 3 miles, in meters
    expect(plan.weeks[0].actualDistance).toBe(3218.68) // 2 miles, in meters
    expect(plan.weeks[1].actualDistance).toBe(1609.34) // 1 mile, in meters

    expect(plan.dates[0].actualDistance).toBe(1609.34) // 1 mile, in meters (10/10)
    expect(plan.dates[1].actualDistance).toBe(0) // (10/11)
    expect(plan.dates[6].actualDistance).toBe(1609.34) // 1 miles, in meters (10/16)
    expect(plan.dates[7].actualDistance).toBe(1609.34) // 1 miles, in meters (10/17)
    expect(plan.dates[8].actualDistance).toBe(0) // (10/18)
  })
})
