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
})
