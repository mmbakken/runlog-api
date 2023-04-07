import mongoose from 'mongoose'
import { DateTime } from 'luxon'
import { jest, describe, expect, beforeAll, beforeEach, afterEach, afterAll, test } from '@jest/globals'

import RunModel from '../db/RunModel.js'
import TrainingModel from '../db/TrainingModel.js'
import DailyStatsModel from '../db/DailyStatsModel.js'
import UserModel from '../db/UserModel.js'

import updateTrainingPlan from './updateTrainingPlan.js'

beforeAll(async () => {
  // Set up test DB
  try {
    await mongoose.connect('mongodb://localhost/updateTrainingPlan', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  } catch (err) {
    console.error('Failed to connect to Mongoose')
    console.dir(err)
  }
})

beforeEach(async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {}) // Ignores console.log, keeps others

  // These tests use the same initial database state
  const user = await UserModel.create({
    name: 'Vlad',
    email: 'lenin@gmail.com'
  })

  const run1 = await RunModel.create({
    userId: user._id,
    name: 'Test Run 1',
    startDate: new Date('2022-10-03T23:07:39Z'), // first day of plan
    startDateLocal: new Date('2022-10-03T17:07:39Z'),
    timezone: '(GMT-06:00) America/Chicago',
    distance: 1000.01, // 1 mile, in meters
  })

  const run2 = await RunModel.create({
    userId: user._id,
    name: 'Test Run 2',
    startDate: new Date('2022-10-10T23:07:39Z'), // last day of plan
    startDateLocal: new Date('2022-10-10T17:07:39Z'),
    timezone: '(GMT-06:00) America/Chicago',
    distance: 1000.02, // 2 miles, in meters
  })

  const run3 = await RunModel.create({
    userId: user._id,
    name: 'Test Run 1',
    startDate: new Date('2022-10-17T23:07:39Z'), // first day of plan
    startDateLocal: new Date('2022-10-17T17:07:39Z'),
    timezone: '(GMT-06:00) America/Chicago',
    distance: 1000.03, // 1 mile, in meters
  })

  const run4 = await RunModel.create({
    userId: user._id,
    name: 'Test Run 2',
    startDate: new Date('2022-10-24T23:07:39Z'), // last day of plan
    startDateLocal: new Date('2022-10-24T17:07:39Z'),
    timezone: '(GMT-06:00) America/Chicago',
    distance: 1000.04, // 2 miles, in meters
  })

  await DailyStatsModel.create({
    userId: user._id,
    date: '2022-10-03',
    distance: 1000.01,
    runIds: [run1._id.toString()]
  })

  await DailyStatsModel.create({
    userId: user._id,
    date: '2022-10-10',
    distance: 1000.02,
    runIds: [run2._id.toString()]
  })

  await DailyStatsModel.create({
    userId: user._id,
    date: '2022-10-17',
    distance: 1000.03,
    runIds: [run3._id.toString()]
  })

  await DailyStatsModel.create({
    userId: user._id,
    date: '2022-10-24',
    distance: 1000.04,
    runIds: [run4._id.toString()]
  })

  // Create a plan that includes these runs
  await TrainingModel.create({
    userId: user._id,
    startDate: '2022-10-10',
    endDate: '2022-10-23',
    timezone: 'America/Denver',
    title: 'Training Plan 2 Weeks',
    goal: 'Update training plans without bugs :)',
    isActive: true,
    actualDistance: 2000.03,
    plannedDistance: 0,
    plannedDistanceMeters: 0,
    weeks: [
    {
      startDateISO: '2022-10-10',
      actualDistance: 1000.01,
      plannedDistance: 0,
      plannedDistanceMeters: 0,
    },
    {
      startDateISO: '2022-10-17',
      actualDistance: 1000.02,
      plannedDistance: 0,
      plannedDistanceMeters: 0,
    }
    ],
    dates: [
      {
        dateISO: '2022-10-10',
        actualDistance: 1000.01,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
        workout: '',
        workoutCategory: 0,
        runIds: [run2._id.toString()],
      },
      {
        dateISO: '2022-10-11',
        actualDistance: 0,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
        workout: '',
        workoutCategory: 0,
        runIds: [],
      },
      {
        dateISO: '2022-10-12',
        actualDistance: 0,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
        workout: '',
        workoutCategory: 0,
        runIds: [],
      },
      {
        dateISO: '2022-10-13',
        actualDistance: 0,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
        workout: '',
        workoutCategory: 0,
        runIds: [],
      },
      {
        dateISO: '2022-10-14',
        actualDistance: 0,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
        workout: '',
        workoutCategory: 0,
        runIds: [],
      },
      {
        dateISO: '2022-10-15',
        actualDistance: 0,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
        workout: '',
        workoutCategory: 0,
        runIds: [],
      },
      {
        dateISO: '2022-10-16',
        actualDistance: 0,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
        workout: '',
        workoutCategory: 0,
        runIds: [],
      },
      {
        dateISO: '2022-10-17',
        actualDistance: 1000.02,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
        workout: '',
        workoutCategory: 0,
        runIds: [run3._id.toString()],
      },
      {
        dateISO: '2022-10-18',
        actualDistance: 0,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
        workout: '',
        workoutCategory: 0,
        runIds: [],
      },
      {
        dateISO: '2022-10-19',
        actualDistance: 0,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
        workout: '',
        workoutCategory: 0,
        runIds: [],
      },
      {
        dateISO: '2022-10-20',
        actualDistance: 0,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
        workout: '',
        workoutCategory: 0,
        runIds: [],
      },
      {
        dateISO: '2022-10-21',
        actualDistance: 0,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
        workout: '',
        workoutCategory: 0,
        runIds: [],
      },
      {
        dateISO: '2022-10-22',
        actualDistance: 0,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
        workout: '',
        workoutCategory: 0,
        runIds: [],
      },
      {
        dateISO: '2022-10-23',
        actualDistance: 0,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
        workout: '',
        workoutCategory: 0,
        runIds: [],
      },
    ],
    journal: []
  })
})

afterEach(async () => {
  // Clean out the db after each test run
  await TrainingModel.deleteMany()
  await UserModel.deleteMany()
  await DailyStatsModel.deleteMany()
})

afterAll(async () => {
  // Tear down test DB
  return await mongoose.connection.close()
})

describe('Training Plan is updated', () => {
  test('Update plan startDate and endDate (1 week earlier, same weekCount)', async () => {
    const user = await UserModel.findOne({}).exec()
    let plan = await TrainingModel.findOne({}).exec()

    // Request to update existing training plan's dates
    const req = {
      user: {
        _id: user._id,
      },
      params: {
        id: plan._id,
      },
      body: {
        updates: {
          startDate: '2022-10-03',
          endDate: '2022-10-16',
          weeks: [
            {
              startDateISO: '2022-10-03',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
            },
            {
              startDateISO: '2022-10-10',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
            }
          ],
          dates: [
            {
              dateISO: '2022-10-03',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-04',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-05',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-06',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-07',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-08',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-09',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-10',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-11',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-12',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-13',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-14',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-15',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-16',
              plannedDistance: 0,
              plannedDistanceMeters: 0,
              workout: '',
              workoutCategory: 0,
            },
          ],
        },
      }
    }

    const res = { 
      status: jest.fn(),
      json: jest.fn(),
    }

    await updateTrainingPlan(req, res)

    plan = await TrainingModel.findOne({}).exec()

    plan.weeks.sort((a, b) => {
      return DateTime.fromISO(a.startDateISO) - DateTime.fromISO(b.startDateISO)
    })

    plan.dates.sort((a, b) => {
      return DateTime.fromISO(a.dateISO) - DateTime.fromISO(b.dateISO)
    })

    expect(plan.actualDistance).toBe(2000.03)
    expect(plan.weeks[0].actualDistance).toBe(1000.01)
    expect(plan.weeks[1].actualDistance).toBe(1000.02)

    expect(plan.dates[0].actualDistance).toBe(1000.01) // 10/03
    expect(plan.dates[0].runIds.length).toBe(1)

    expect(plan.dates[1].actualDistance).toBe(0) // 10/04
    expect(plan.dates[2].actualDistance).toBe(0) // 10/05
    expect(plan.dates[3].actualDistance).toBe(0) // 10/06
    expect(plan.dates[4].actualDistance).toBe(0) // 10/07
    expect(plan.dates[5].actualDistance).toBe(0) // 10/08
    expect(plan.dates[6].actualDistance).toBe(0) // 10/09

    expect(plan.dates[7].actualDistance).toBe(1000.02) // 10/10
    expect(plan.dates[7].runIds.length).toBe(1)

    expect(plan.dates[8].actualDistance).toBe(0) // 10/11
    expect(plan.dates[9].actualDistance).toBe(0) // 10/12
    expect(plan.dates[10].actualDistance).toBe(0) // 10/13
    expect(plan.dates[11].actualDistance).toBe(0) // 10/14
    expect(plan.dates[12].actualDistance).toBe(0) // 10/15

    expect(plan.dates[13].actualDistance).toBe(0) // 10/16
    expect(plan.dates[13].runIds.length).toBe(0) // 10/16
  })

  test('Plan date.plannedDistance value results in correct date.plannedDistanceMeters field', async () => {
    const user = await UserModel.findOne({}).exec()
    let plan = await TrainingModel.findOne({}).exec()

    // Request to update existing training plan's plannedDistance field
    // plannedDistanceMeters field should always be ignored by endpoint
    const req = {
      user: {
        _id: user._id,
      },
      params: {
        id: plan._id,
      },
      body: {
        updates: {
          startDate: '2022-10-10',
          endDate: '2022-10-23',
          plannedDistance: 1,
          plannedDistanceMeters: 0,
          weeks: [
            {
              startDateISO: '2022-10-10',
              actualDistance: 1000.01,
              plannedDistance: 1,
              plannedDistanceMeters: 0,
            },
            {
              startDateISO: '2022-10-17',
              actualDistance: 1000.02,
              plannedDistance: 0,
              plannedDistanceMeters: 0,
            }
          ],
          dates: [
            {
              dateISO: '2022-10-10',
              actualDistance: 1000.01,
              plannedDistance: 1,
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
              actualDistance: 0,
              plannedDistance: 0,
              plannedDistanceMeters: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-17',
              actualDistance: 1000.02,
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
        },
      }
    }

    const res = { 
      status: jest.fn(),
      json: jest.fn(),
    }

    await updateTrainingPlan(req, res)

    plan = await TrainingModel.findOne({}).exec()

    plan.weeks.sort((a, b) => {
      return DateTime.fromISO(a.startDateISO) - DateTime.fromISO(b.startDateISO)
    })

    plan.dates.sort((a, b) => {
      return DateTime.fromISO(a.dateISO) - DateTime.fromISO(b.dateISO)
    })

    expect(plan.plannedDistanceMeters).toBe(1609.34)
    expect(plan.weeks[0].plannedDistanceMeters).toBe(1609.34)
    expect(plan.weeks[1].plannedDistanceMeters).toBe(0)

    expect(plan.dates[0].plannedDistanceMeters).toBe(1609.34)
    expect(plan.dates[1].plannedDistanceMeters).toBe(0)
    expect(plan.dates[2].plannedDistanceMeters).toBe(0)
    expect(plan.dates[3].plannedDistanceMeters).toBe(0)
    expect(plan.dates[4].plannedDistanceMeters).toBe(0)
    expect(plan.dates[5].plannedDistanceMeters).toBe(0)
    expect(plan.dates[6].plannedDistanceMeters).toBe(0)
    expect(plan.dates[7].plannedDistanceMeters).toBe(0)
    expect(plan.dates[8].plannedDistanceMeters).toBe(0)
    expect(plan.dates[9].plannedDistanceMeters).toBe(0)
    expect(plan.dates[10].plannedDistanceMeters).toBe(0)
    expect(plan.dates[11].plannedDistanceMeters).toBe(0)
    expect(plan.dates[12].plannedDistanceMeters).toBe(0)
    expect(plan.dates[13].plannedDistanceMeters).toBe(0)
  })
})
