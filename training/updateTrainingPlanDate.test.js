import mongoose from 'mongoose'
import { DateTime } from 'luxon'
import {
  jest,
  describe,
  expect,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  test,
} from '@jest/globals'

import TrainingModel from '../db/TrainingModel.js'
import DailyStatsModel from '../db/DailyStatsModel.js'
import UserModel from '../db/UserModel.js'

import updateTrainingPlanDate from './updateTrainingPlanDate.js'

beforeAll(async () => {
  // Set up test DB
  try {
    await mongoose.connect('mongodb://localhost/updateTrainingPlanDate', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
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
    email: 'lenin@gmail.com',
  })

  // Only need to create the dailystats - runs aren't necessary for calculations
  await DailyStatsModel.create({
    userId: user._id,
    date: '2022-10-03',
    distance: 1000.01,
  })

  await DailyStatsModel.create({
    userId: user._id,
    date: '2022-10-10',
    distance: 1000.02,
  })

  await DailyStatsModel.create({
    userId: user._id,
    date: '2022-10-17',
    distance: 1000.03,
  })

  await DailyStatsModel.create({
    userId: user._id,
    date: '2022-10-24',
    distance: 1000.04,
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
      },
    ],
    dates: [
      {
        dateISO: '2022-10-10',
        actualDistance: 1000.01,
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
    journal: [],
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

describe('Training Plan date update endpoint', () => {
  test('Endpoint correctly handles date.plannedDistance updates to plan document', async () => {
    const user = await UserModel.findOne({}).exec()
    let plan = await TrainingModel.findOne({}).exec()

    // Request to update existing training plan's dates
    const req = {
      user: {
        _id: user._id,
      },
      params: {
        id: plan._id,
        dateISO: '2022-10-10',
      },
      body: {
        updates: {
          dateISO: '2022-10-10',
          plannedDistance: 1, // Used to be 0
          workout: '',
          workoutCategory: 0,
        },
      },
    }

    const res = {
      status: jest.fn(),
      json: jest.fn(),
    }

    await updateTrainingPlanDate(req, res)

    plan = await TrainingModel.findOne({}).exec()

    plan.weeks.sort((a, b) => {
      return DateTime.fromISO(a.startDateISO) - DateTime.fromISO(b.startDateISO)
    })

    plan.dates.sort((a, b) => {
      return DateTime.fromISO(a.dateISO) - DateTime.fromISO(b.dateISO)
    })

    expect(plan.plannedDistance).toBe(1)
    expect(plan.plannedDistanceMeters).toBe(1609.34)

    expect(plan.weeks[0].plannedDistance).toBe(1)
    expect(plan.weeks[1].plannedDistance).toBe(0)
    expect(plan.weeks[0].plannedDistanceMeters).toBe(1609.34)
    expect(plan.weeks[1].plannedDistanceMeters).toBe(0)

    expect(plan.dates[0].plannedDistance).toBe(1)
    expect(plan.dates[1].plannedDistance).toBe(0)
    expect(plan.dates[2].plannedDistance).toBe(0)
    expect(plan.dates[3].plannedDistance).toBe(0)
    expect(plan.dates[4].plannedDistance).toBe(0)
    expect(plan.dates[5].plannedDistance).toBe(0)
    expect(plan.dates[6].plannedDistance).toBe(0)
    expect(plan.dates[7].plannedDistance).toBe(0)
    expect(plan.dates[8].plannedDistance).toBe(0)
    expect(plan.dates[9].plannedDistance).toBe(0)
    expect(plan.dates[10].plannedDistance).toBe(0)
    expect(plan.dates[11].plannedDistance).toBe(0)
    expect(plan.dates[12].plannedDistance).toBe(0)
    expect(plan.dates[13].plannedDistance).toBe(0)

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
