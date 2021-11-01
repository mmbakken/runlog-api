import { DateTime } from 'luxon'
import mongoose from 'mongoose'
import connectToMongo from '../db/connectToMongo.js'
import DailyStatsModel from '../db/DailyStatsModel.js'
import RunModel from '../db/RunModel.js'
import UserModel from '../db/UserModel.js'
import { expect, beforeAll, afterEach, afterAll, test } from '@jest/globals'

// TODO: Test cases to implement:
// 1. Add a run that is later than every existing run
//   - This will be the most common scenario (new run happens today, is synced right after)
// 2. Add a run that is later than some runs in a week, but not the latest.
//   - E.g. Multiple runs added back to back, but later run is added before an earlier one in the same week
// 3. Add a run that has no other runs in the same week or within seven days
//   - E.g. The user takes a break from running for a while. Only this DS document should be affected.
// 4. Add a run that occurs before and after existing runs
//   - E.g. Something went wrong and we went to resync Strava runs, and now we're adding a run far in the past
//
// Test framework:
// - Generate a set of DailyStats and Run documents to populate a test database
// - Attempt to add another run via stravaWebhookHandler.js
// - This function gets called for a new run
// - Validate that the database has exactly the new contents we anticipate, given the new run's date
//   and the Runs/DailyStats we populated the test database with.


// STEP 1: Able to add a DailyStats document to the test db
// - Set up test db
// - Add DailyStats to DB, validate
// - Tear down db

// STEP 2: Given a run object and user object, make sure 

beforeAll(async () => {
  // Set up test DB
  await connectToMongo('test')
})

afterEach(async () => {
  // Clean out the db after each test run
  await DailyStatsModel.deleteMany()
  await RunModel.deleteMany()
  await UserModel.deleteMany()
})

afterAll(() => {
  // Tear down test DB
  mongoose.connection.close()
})

test('Can create a new DailyStats document', async () => {
  // Make a run to base the DailyStats on
  const run = await RunModel.create({
    startDate: DateTime.fromObject({
     year: 2021,
     month: 10,
     day: 10,
     hour: 17,
    }, {
     zone: 'America/Denver'
    }).toUTC(),
    title: 'Afternoon Run',
    distance: 6900.01, // meters
  })

  const user = await UserModel.create({
    name: 'Vlad',
    email: 'lenin@gmail.com'
  })

  // Make the DailyStats using hardcoded values to make sure document creation works
  await DailyStatsModel.create({
    userId: user._id,
    date: DateTime.fromJSDate(run.startDate).toISODate(),
    distance: run.distance,
    title: run.title,
    runIds: [run._id],
    sevenDayDistance: run.distance,
    weeklyDistance: run.distance,
  })

  expect(DailyStatsModel.findOne({date: '2021-10-10'})).toBe(1)
})
