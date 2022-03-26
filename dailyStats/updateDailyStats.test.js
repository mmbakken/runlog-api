import { DateTime } from 'luxon'
import mongoose from 'mongoose'
import DailyStatsModel from '../db/DailyStatsModel.js'
import RunModel from '../db/RunModel.js'
import UserModel from '../db/UserModel.js'
import { expect, beforeAll, afterEach, afterAll, test } from '@jest/globals'

import updateDailyStats from './updateDailyStats.js'

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

beforeAll(async () => {
  // Set up test DB
  try {
    await mongoose.connect('mongodb://localhost/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  } catch (err) {
    console.error('Failed to connect to Mongoose')
    console.dir(err)
  }
})

afterEach(async () => {
  // Clean out the db after each test run
  await DailyStatsModel.deleteMany()
  await RunModel.deleteMany()
  await UserModel.deleteMany()
})

afterAll(async () => {
  // Tear down test DB
  return mongoose.connection.close()
})

test('Can create a new DailyStats document', async () => {
  // Make a run to base the DailyStats on
  const run = await RunModel.create({
    startDate: DateTime.fromObject({
     year: 2021,
     month: 10,
     day: 10,
     hour: 15,
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

  const ds = await DailyStatsModel.find({date: '2021-10-10'}).exec()

  expect(ds.length).toBe(1)
})

test('Creates a DailyStats document when one Run document is created.', async () => {
  // Make a run to base the DailyStats on
  const run = await RunModel.create({
    startDate: DateTime.fromObject({
     year: 2021,
     month: 10,
     day: 10,
     hour: 15,
    }, {
     zone: 'America/Denver'
    }).toUTC(),
    timezone: '(GMT-07:00) America/Denver',
    title: 'Afternoon Run',
    distance: 6900.01, // meters
  })

  const user = await UserModel.create({
    name: 'Vlad',
    email: 'lenin@gmail.com'
  })

  await updateDailyStats(run, user)

  const ds = await DailyStatsModel.find({date: '2021-10-10'}).exec()
  expect(ds.length).toBe(1)
  expect(ds[0].distance).toBe(6900.01)
  expect(ds[0].sevenDayDistance).toBe(6900.01)
  expect(ds[0].weeklyDistance).toBe(6900.01)
  expect(ds[0].runIds).toContainEqual(run._id)
})

test('DailyStats sevenDayDistance is correct when adding a second run', async () => {
  const user = await UserModel.create({
    name: 'Vlad',
    email: 'lenin@gmail.com'
  })

  // Run + DailyStats that existed prior to today's new run
  const run = await RunModel.create({
    startDate: DateTime.fromObject({
     year: 2022,
     month: 3,
     day: 24,
     hour: 15,
    }, {
     zone: 'America/Denver'
    }).toUTC(),
    timezone: '(GMT-07:00) America/Denver',
    title: 'Afternoon Run',
    distance: 1000, // meters
  })

  // Existing DS document
  await DailyStatsModel.create({
    userId: user._id,
    date: DateTime.fromJSDate(run.startDate).toISODate(),
    distance: run.distance,
    title: run.title,
    runIds: [run._id],
    sevenDayDistance: run.distance,
    weeklyDistance: run.distance,
  })

  // New run to base a new DailyStats on
  const newRun = await RunModel.create({
    startDate: DateTime.fromObject({
     year: 2022,
     month: 3,
     day: 25,
     hour: 15,
    }, {
     zone: 'America/Denver'
    }).toUTC(),
    timezone: '(GMT-07:00) America/Denver',
    title: 'Afternoon Run',
    distance: 6900.01, // meters
  })

  await updateDailyStats(newRun, user)

  const ds = await DailyStatsModel.find({date: '2022-03-25'}).exec()
  expect(ds.length).toBe(1)
  expect(ds[0].distance).toBe(6900.01)
  expect(ds[0].sevenDayDistance).toBe(7900.01)
  expect(ds[0].weeklyDistance).toBe(7900.01)
  expect(ds[0].runIds).toContainEqual(newRun._id)
})

test('DailyStats sevenDayDistance and weeklyDistance is correct when adding a third run over a week boundary', async () => {
  const user = await UserModel.create({
    name: 'Vlad',
    email: 'lenin@gmail.com',
    stats: {
      weekStartsOn: 1 // Monday
    }
  })

  // Run + DailyStats that existed prior to today's new run
  const run1 = await RunModel.create({
    startDate: DateTime.fromObject({
     year: 2022,
     month: 3,
     day: 19, // Saturday
     hour: 15,
    }, {
     zone: 'America/Denver'
    }).toUTC(),
    timezone: '(GMT-07:00) America/Denver',
    title: 'Afternoon Run',
    distance: 1000, // meters
  })

  // Run + DailyStats that existed prior to today's new run
  const run2 = await RunModel.create({
    startDate: DateTime.fromObject({
     year: 2022,
     month: 3,
     day: 22, // Tuesday
     hour: 15,
    }, {
     zone: 'America/Denver'
    }).toUTC(),
    timezone: '(GMT-07:00) America/Denver',
    title: 'Afternoon Run',
    distance: 1000, // meters
  })

  // Existing DS documents
  await DailyStatsModel.create({
    userId: user._id,
    date: DateTime.fromJSDate(run1.startDate).toISODate(),
    distance: run1.distance,
    title: run1.title,
    runIds: [run1._id],
    sevenDayDistance: run1.distance,
    weeklyDistance: run1.distance,
  })

  await DailyStatsModel.create({
    userId: user._id,
    date: DateTime.fromJSDate(run2.startDate).toISODate(),
    distance: run2.distance,
    title: run2.title,
    runIds: [run2._id],
    sevenDayDistance: run2.distance,
    weeklyDistance: run2.distance,
  })

  // New run to base a new DailyStats on
  const newRun = await RunModel.create({
    startDate: DateTime.fromObject({
     year: 2022,
     month: 3,
     day: 24, // Thursday
     hour: 15,
    }, {
     zone: 'America/Denver'
    }).toUTC(),
    timezone: '(GMT-07:00) America/Denver',
    title: 'Afternoon Run',
    distance: 1000, // meters
  })

  await updateDailyStats(newRun, user)

  const ds = await DailyStatsModel.find({date: '2022-03-24'}).exec()
  expect(ds.length).toBe(1)
  expect(ds[0].distance).toBe(1000)
  expect(ds[0].sevenDayDistance).toBe(3000)
  expect(ds[0].weeklyDistance).toBe(2000)
  expect(ds[0].runIds).toContainEqual(newRun._id)
})

test('DailyStats sevenDayDistance and weeklyDistance is correct when adding a second run with a date BEFORE an existing run', async () => {
  const user = await UserModel.create({
    name: 'Vlad',
    email: 'lenin@gmail.com'
  })

  // Run + DailyStats that existed prior to the "new" run being added at a priot date
  const run = await RunModel.create({
    startDate: DateTime.fromObject({
     year: 2022,
     month: 3,
     day: 25,
     hour: 6,
    }, {
     zone: 'America/Denver'
    }).toUTC(),
    timezone: '(GMT-07:00) America/Denver',
    title: 'Afternoon Run',
    distance: 1000, // meters
  })

  // Existing run's DS document
  await DailyStatsModel.create({
    userId: user._id,
    date: DateTime.fromJSDate(run.startDate).toISODate(),
    distance: run.distance,
    title: run.title,
    runIds: [run._id],
    sevenDayDistance: run.distance,
    weeklyDistance: run.distance,
  })

  // New run to base a new DailyStats on
  const newRun = await RunModel.create({
    startDate: DateTime.fromObject({
     year: 2022,
     month: 3,
     day: 24,
     hour: 6,
    }, {
     zone: 'America/Denver'
    }).toUTC(),
    timezone: '(GMT-07:00) America/Denver',
    title: 'Afternoon Run',
    distance: 6900.01, // meters
  })

  await updateDailyStats(newRun, user)

  const ds = await DailyStatsModel.find({date: '2022-03-25'}).exec()
  expect(ds.length).toBe(1)
  expect(ds[0].distance).toBe(1000)
  expect(ds[0].sevenDayDistance).toBe(7900.01)
  expect(ds[0].weeklyDistance).toBe(7900.01)
})

// Test to add:
// - Multiple runs on the same day, added in sequence
