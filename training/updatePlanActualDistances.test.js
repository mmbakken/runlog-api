import mongoose from 'mongoose'
import { jest, describe, expect, beforeAll, beforeEach, afterEach, afterAll, test } from '@jest/globals'

import TrainingModel from '../db/TrainingModel.js'
import DailyStatsModel from '../db/DailyStatsModel.js'
import UserModel from '../db/UserModel.js'

import updatePlanActualDistances from './updatePlanActualDistances.js'

beforeAll(async () => {
  // Set up test DB
  try {
    await mongoose.connect('mongodb://localhost/updatePlanActualDistances', {
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

  const notUser = await UserModel.create({
    name: 'Not the plan user',
    email: 'not@gmail.com'
  })

  // Only need to create the dailystats - runs aren't necessary for calculations
  await DailyStatsModel.create({
    userId: user._id,
    date: '2022-10-10',
    distance: 1000.01,
  })

  await DailyStatsModel.create({
    userId: user._id,
    date: '2022-10-17',
    distance: 1000.02,
  })

  await DailyStatsModel.create({
    userId: user._id,
    date: '2022-10-18',
    distance: 1000.03,
  })

  // Counts should NOT include these DS distances
  await DailyStatsModel.create({
    userId: user._id,
    date: '2022-10-24', // after plan date range
    distance: 1001,
  })

  await DailyStatsModel.create({
    userId: user._id,
    date: '2022-10-09', // before plan date range
    distance: 1002,
  })

  await DailyStatsModel.create({
    userId: notUser._id, // Not the right user
    date: '2022-10-10',
    distance: 1003,
  })

  // Create a plan that we can use to test if the actualDistance fields were set correctly
  await TrainingModel.create({
    userId: user._id,
    startDate: '2022-10-10',
    endDate: '2022-10-23',
    timezone: 'America/Denver',
    title: 'Training Plan 2 Weeks',
    goal: 'Update training plans actual distances',
    isActive: true,
    actualDistance: 0,
    plannedDistance: 0,
    weeks: [
      {
        startDateISO: '2022-10-10',
        actualDistance: 0,
        plannedDistance: 0,
      },
      {
        startDateISO: '2022-10-17',
        actualDistance: 0,
        plannedDistance: 0,
      }
    ],
    dates: [
      {
        dateISO: '2022-10-10',
        actualDistance: 0,
        plannedDistance: 0,
        workout: '',
        workoutCategory: 0,
      },
      {
        dateISO: '2022-10-11',
        actualDistance: 0,
        plannedDistance: 0,
        workout: '',
        workoutCategory: 0,
      },
      {
        dateISO: '2022-10-12',
        actualDistance: 0,
        plannedDistance: 0,
        workout: '',
        workoutCategory: 0,
      },
      {
        dateISO: '2022-10-13',
        actualDistance: 0,
        plannedDistance: 0,
        workout: '',
        workoutCategory: 0,
      },
      {
        dateISO: '2022-10-14',
        actualDistance: 0,
        plannedDistance: 0,
        workout: '',
        workoutCategory: 0,
      },
      {
        dateISO: '2022-10-15',
        actualDistance: 0,
        plannedDistance: 0,
        workout: '',
        workoutCategory: 0,
      },
      {
        dateISO: '2022-10-16',
        actualDistance: 0,
        plannedDistance: 0,
        workout: '',
        workoutCategory: 0,
      },
      {
        dateISO: '2022-10-17',
        actualDistance: 0,
        plannedDistance: 0,
        workout: '',
        workoutCategory: 0,
      },
      {
        dateISO: '2022-10-18',
        actualDistance: 0,
        plannedDistance: 0,
        workout: '',
        workoutCategory: 0,
      },
      {
        dateISO: '2022-10-19',
        actualDistance: 0,
        plannedDistance: 0,
        workout: '',
        workoutCategory: 0,
      },
      {
        dateISO: '2022-10-20',
        actualDistance: 0,
        plannedDistance: 0,
        workout: '',
        workoutCategory: 0,
      },
      {
        dateISO: '2022-10-21',
        actualDistance: 0,
        plannedDistance: 0,
        workout: '',
        workoutCategory: 0,
      },
      {
        dateISO: '2022-10-22',
        actualDistance: 0,
        plannedDistance: 0,
        workout: '',
        workoutCategory: 0,
      },
      {
        dateISO: '2022-10-23',
        actualDistance: 0,
        plannedDistance: 0,
        workout: '',
        workoutCategory: 0,
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

describe('Plan actualDistance recalculation function', () => {
  test('Actual distance fields are summed from DailyStats appropriately', async () => {
    const plan = await TrainingModel.findOne({}).exec()

    await updatePlanActualDistances(plan)

    expect(plan.actualDistance).toBe(3000.06)
    expect(plan.weeks[0].actualDistance).toBe(1000.01)
    expect(plan.weeks[1].actualDistance).toBe(2000.05)
    expect(plan.dates[0].actualDistance).toBe(1000.01)
    expect(plan.dates[1].actualDistance).toBe(0)
    expect(plan.dates[7].actualDistance).toBe(1000.02)
    expect(plan.dates[8].actualDistance).toBe(1000.03)
    expect(plan.dates[9].actualDistance).toBe(0)
  })
})
