import mongoose from 'mongoose'
import TrainingModel from '../db/TrainingModel.js'
import DailyStatsModel from '../db/DailyStatsModel.js'
import RunModel from '../db/RunModel.js'
import UserModel from '../db/UserModel.js'
import { jest, describe, expect, beforeAll, beforeEach, afterEach, afterAll, test } from '@jest/globals'

import deleteRun from './deleteRun.js'

beforeAll(async () => {
  // Set up test DB
  try {
    await mongoose.connect('mongodb://localhost/deleteRun', {
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
  await DailyStatsModel.deleteMany()
})

afterAll(async () => {
  // Tear down test DB
  return await mongoose.connection.close()
})

describe('Run deletion', () => {
  test('Delete a single run', async () => {
    const user = await UserModel.create({
      name: 'Vlad',
      email: 'lenin@gmail.com'
    })

    const run = await RunModel.create({
      userId: user._id,
      name: 'Test Run 1',
      startDate: new Date('2022-10-03T23:07:39Z'), // first day of plan
      startDateLocal: new Date('2022-10-03T17:07:39Z'),
      timezone: '(GMT-06:00) America/Chicago',
      distance: 1609.34, // 1 mile, in meters
    })

    // Existing DS document
    await DailyStatsModel.create({
      userId: user._id,
      date: '2022-10-03',
      distance: 1609.34,
      runIds: [run._id],
    })

    await TrainingModel.create({
      userId: user._id,
      startDate: '2022-10-03',
      endDate: '2022-10-09',
      timezone: 'America/Denver',
      title: 'Training Plan 1 Week',
      goal: 'Delete run inside training plans without bugs :)',
      isActive: true,
      actualDistance: 1609.34, // 1 mile, in meters
      plannedDistance: 1,
      plannedDistanceMeters: 1609.34, // 1 mile, in meters
      weeks: [{
        startDateISO: '2022-10-03',
        actualDistance: 1609.34, // 1 mile, in meters
        plannedDistance: 1,
        plannedDistanceMeters: 1609.34, // 1 mile, in meters
      }],
      dates: [
        {
          dateISO: '2022-10-03',
          actualDistance: 1609.34, // 1 mile, in meters
          plannedDistance: 1,
          plannedDistanceMeters: 1609.34, // 1 mile, in meters
          workout: '',
          workoutCategory: 1, // Easy
          runIds: [run._id.toString()],
        },
        {
          dateISO: '2022-10-04',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
          runIds: [],
        },
        {
          dateISO: '2022-10-05',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
          runIds: [],
        },
        {
          dateISO: '2022-10-06',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
          runIds: [],
        },
        {
          dateISO: '2022-10-07',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
          runIds: [],
        },
        {
          dateISO: '2022-10-08',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
          runIds: [],
        },
        {
          dateISO: '2022-10-09',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
          runIds: [],
        }
      ],
      journal: []
    })

    await TrainingModel.create({
      userId: user._id,
      startDate: '2022-10-03',
      endDate: '2022-10-09',
      timezone: 'America/Denver',
      title: 'Another training plan',
      goal: 'Delete run inside training plans without bugs :)',
      isActive: true,
      actualDistance: 1609.34, // 1 mile, in meters
      plannedDistance: 1,
      plannedDistanceMeters: 1609.34, // 1 mile, in meters
      weeks: [{
        startDateISO: '2022-10-03',
        actualDistance: 1609.34, // 1 mile, in meters
        plannedDistance: 1,
        plannedDistanceMeters: 1609.34, // 1 mile, in meters
      }],
      dates: [
        {
          dateISO: '2022-10-03',
          actualDistance: 1609.34, // 1 mile, in meters
          plannedDistance: 1,
          plannedDistanceMeters: 1609.34, // 1 mile, in meters
          workout: '',
          workoutCategory: 1, // Easy
          runIds: [run._id.toString()],
        },
        {
          dateISO: '2022-10-04',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
          runIds: [],
        },
        {
          dateISO: '2022-10-05',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
          runIds: [],
        },
        {
          dateISO: '2022-10-06',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
          runIds: [],
        },
        {
          dateISO: '2022-10-07',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
          runIds: [],
        },
        {
          dateISO: '2022-10-08',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
          runIds: [],
        },
        {
          dateISO: '2022-10-09',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
          runIds: [],
        }
      ],
      journal: []
    })

    const req = {
      user: user,
      params: {
        id: run._id.toString()
      }
    }

    const res = {
      sendStatus: jest.fn,
      json: jest.fn,
    }

    await deleteRun(req, res)

    const runs = await RunModel.find({}).exec()
    expect(runs.length).toBe(0)

    const dsList = await DailyStatsModel.find({}).exec()
    expect(dsList.length).toBe(0)

    const plans = await TrainingModel.find({}).exec()
    expect(plans.length).toBe(2)

    const planA = plans[0]
    expect(planA.actualDistance).toBe(0)
    expect(planA.plannedDistance).toBe(1)
    expect(planA.plannedDistanceMeters).toBe(1609.34)
    expect(planA.weeks[0].actualDistance).toBe(0)
    expect(planA.weeks[0].plannedDistance).toBe(1)
    expect(planA.weeks[0].plannedDistanceMeters).toBe(1609.34)
    expect(planA.dates[0].actualDistance).toBe(0)
    expect(planA.dates[0].plannedDistance).toBe(1)
    expect(planA.dates[0].plannedDistanceMeters).toBe(1609.34)
    expect(planA.dates[0].runIds.length).toBe(0)

    // Make sure all plans that include this run's date get updated appropriately
    const planB = plans[0]
    expect(planB.actualDistance).toBe(0)
    expect(planB.plannedDistance).toBe(1)
    expect(planB.plannedDistanceMeters).toBe(1609.34)
    expect(planB.weeks[0].actualDistance).toBe(0)
    expect(planB.weeks[0].plannedDistance).toBe(1)
    expect(planB.weeks[0].plannedDistanceMeters).toBe(1609.34)
    expect(planB.dates[0].actualDistance).toBe(0)
    expect(planB.dates[0].plannedDistance).toBe(1)
    expect(planB.dates[0].plannedDistanceMeters).toBe(1609.34)
    expect(planB.dates[0].runIds.length).toBe(0)
  })
})
