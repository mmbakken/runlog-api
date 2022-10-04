import mongoose from 'mongoose'
import TrainingModel from '../db/TrainingModel.js'
import UserModel from '../db/UserModel.js'
import { jest, describe, expect, beforeAll, afterEach, afterAll, test } from '@jest/globals'

import createTrainingPlan from './createTrainingPlan.js'

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
  await TrainingModel.deleteMany()
  await UserModel.deleteMany()
})

afterAll(async () => {
  // Tear down test DB
  return mongoose.connection.close()
})

describe('Training creation', () => {
  test('Creates a new Training document', async () => {
    await TrainingModel.create({
      startDate: '2022-10-03',
      endDate: '2022-10-09',
      timezone: 'America/Denver',
      title: 'Training Plan 1 Week',
      goal: 'Create training plans without bugs :)',
      isActive: true,
      actualDistance: 10,
      plannedDistance: 10,
      weeks: [{
        actualDistance: 10,
        plannedDistance: 10,
        percentChange: null,
      }],
      dates: [
        {
          date: '2022-10-03',
          actualDistance: 10,
          plannedDistance: 10,
          workout: '',
          workoutCategory: 1,
        },
        {
          date: '2022-10-04',
          actualDistance: 0,
          plannedDistance: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          date: '2022-10-05',
          actualDistance: 0,
          plannedDistance: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          date: '2022-10-06',
          actualDistance: 0,
          plannedDistance: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          date: '2022-10-07',
          actualDistance: 0,
          plannedDistance: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          date: '2022-10-08',
          actualDistance: 0,
          plannedDistance: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          date: '2022-10-09',
          actualDistance: 0,
          plannedDistance: 0,
          workout: '',
          workoutCategory: 0,
        }
      ],
      journal: []
    })

    const plans = await TrainingModel.find({}).exec()
    expect(plans.length).toBe(1)
  })

  test('Creates a Training plan via the endpoint function', async () => {
    const user = await UserModel.create({
      name: 'Vlad',
      email: 'lenin@gmail.com'
    })

    // Now test if the creation function works, not just the db
    const req = {
      user: {
        id: user._id,
      },
      body: {
        startDate: '2022-10-10',
        endDate: '2022-12-04',
        weekCount: 8, 
        timezone: 'America/Denver',
        title: 'Training Plan – 8 Weeks',
        goal: 'Create training plans without bugs :)',
        isActive: false,
      }
    }

    const res = { 
      status: jest.fn(),
      json: jest.fn(),
    }

    await createTrainingPlan(req, res)
    const plans = await TrainingModel.find({}).exec()
    expect(plans.length).toBe(1)
  })
})
