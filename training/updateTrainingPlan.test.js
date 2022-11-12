import mongoose from 'mongoose'
import { DateTime } from 'luxon'
import { jest, describe, expect, beforeAll, beforeEach, afterEach, afterAll, test } from '@jest/globals'

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
    weeks: [
    {
      startDateISO: '2022-10-10',
      actualDistance: 1000.01,
      plannedDistance: 10,
    },
    {
      startDateISO: '2022-10-17',
      actualDistance: 1000.02,
      plannedDistance: 0,
    }
    ],
    dates: [
      {
        dateISO: '2022-10-10',
        actualDistance: 1000.01,
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
        actualDistance: 1000.02,
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

describe('Training Plan startDate/endDate changes', () => {
  test('Plan actualDistance fields are correct update moves startDate 1 week earlier and endDate 1 week earlier', async () => {
    const user = await UserModel.findOne({}).exec()
    let plan = await TrainingModel.findOne({}).exec()

    // Request to update existing training plan's dates
    const req = {
      user: {
        id: user._id,
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
            },
            {
              startDateISO: '2022-10-10',
              plannedDistance: 0,
            }
          ],
          dates: [
            {
              dateISO: '2022-10-03',
              plannedDistance: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-04',
              plannedDistance: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-05',
              plannedDistance: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-06',
              plannedDistance: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-07',
              plannedDistance: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-08',
              plannedDistance: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-09',
              plannedDistance: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-10',
              plannedDistance: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-11',
              plannedDistance: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-12',
              plannedDistance: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-13',
              plannedDistance: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-14',
              plannedDistance: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-15',
              plannedDistance: 0,
              workout: '',
              workoutCategory: 0,
            },
            {
              dateISO: '2022-10-16',
              plannedDistance: 0,
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

    expect(plan.dates[0].actualDistance).toBe(1000.01)
    expect(plan.dates[1].actualDistance).toBe(0)
    expect(plan.dates[2].actualDistance).toBe(0)
    expect(plan.dates[3].actualDistance).toBe(0)
    expect(plan.dates[4].actualDistance).toBe(0)
    expect(plan.dates[5].actualDistance).toBe(0)
    expect(plan.dates[6].actualDistance).toBe(0)
    expect(plan.dates[7].actualDistance).toBe(1000.02)
    expect(plan.dates[8].actualDistance).toBe(0)
    expect(plan.dates[9].actualDistance).toBe(0)
    expect(plan.dates[10].actualDistance).toBe(0)
    expect(plan.dates[11].actualDistance).toBe(0)
    expect(plan.dates[12].actualDistance).toBe(0)
    expect(plan.dates[13].actualDistance).toBe(0)
  })
})
