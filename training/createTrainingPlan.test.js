import mongoose from 'mongoose'
import TrainingModel from '../db/TrainingModel.js'
import RunModel from '../db/RunModel.js'
import DailyStatsModel from '../db/DailyStatsModel.js'
import UserModel from '../db/UserModel.js'
import { jest, describe, expect, beforeAll, afterEach, afterAll, test } from '@jest/globals'

import createTrainingPlan from './createTrainingPlan.js'

beforeAll(async () => {
  // Set up test DB
  try {
    await mongoose.connect('mongodb://localhost/training', {
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
  await RunModel.deleteMany()
  await DailyStatsModel.deleteMany()
})

afterAll(async () => {
  // Tear down test DB
  return await mongoose.connection.close()
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
      actualDistance: 0,
      plannedDistance: 0,
      plannedDistanceMeters: 0,
      weeks: [{
        actualDistance: 0,
        plannedDistance: 0,
        plannedDistanceMeters: 0,
      }],
      dates: [
        {
          dateISO: '2022-10-03',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-04',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-05',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-06',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-07',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-08',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
          workout: '',
          workoutCategory: 0,
        },
        {
          dateISO: '2022-10-09',
          actualDistance: 0,
          plannedDistance: 0,
          plannedDistanceMeters: 0,
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

    expect(plans[0].weeks.length).toBe(8)
    expect(plans[0].dates.length).toBe(56)
  })

  test('Creates a Training Plan with one week of existing runs', async () => {
    const user = await UserModel.create({
      name: 'Vlad',
      email: 'lenin@gmail.com'
    })

    // Create some runs that exist prior to the creation of this plan
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
      startDate: new Date('2022-10-16T23:07:39Z'), // last day of plan
      startDateLocal: new Date('2022-10-16T17:07:39Z'),
      timezone: '(GMT-06:00) America/Chicago',
      distance: 3218.69, // 2 miles, in meters
    })

    // Matching DailyStats objects for the runs
    await DailyStatsModel.create({
      userId: user._id,
      date: '2022-10-10',
      distance: 1609.34,
    })
    await DailyStatsModel.create({
      userId: user._id,
      date: '2022-10-16',
      distance: 3218.69,
    })

    // Request to create 1-week training plan during week of the runs
    const req = {
      user: {
        id: user._id,
      },
      body: {
        startDate: '2022-10-10',
        endDate: '2022-10-16',
        weekCount: 1,
        timezone: 'America/Denver',
        title: 'Training Plan 1',
        goal: 'Create training plans without bugs :)',
        isActive: false,
      }
    }

    const res = { 
      status: jest.fn(),
      json: jest.fn(),
    }

    // Make the plan
    await createTrainingPlan(req, res)
    const plan1 = await TrainingModel.findOne({title: 'Training Plan 1'}).exec()

    expect(plan1.actualDistance).toBe(4828.03) // 3 miles (in meters)
    expect(plan1.weeks[0].actualDistance).toBe(4828.03) // 3 miles (in meters)
    expect(plan1.dates[0].actualDistance).toBe(1609.34) // 1 mile, in meters
    expect(plan1.dates[1].actualDistance).toBe(0) // 2 miles, in meters
    expect(plan1.dates[6].actualDistance).toBe(3218.69) // 2 miles, in meters
  })

  test('Creates a Training Plan with multiple weeks of existing runs', async () => {
    const user = await UserModel.create({
      name: 'Vlad',
      email: 'lenin@gmail.com'
    })

    // Create some runs that exist prior to the creation of this plan
    await RunModel.create({
      userId: user._id,
      name: 'Test Run 1',
      startDate: new Date('2022-10-10T23:07:39Z'),
      startDateLocal: new Date('2022-10-10T17:07:39Z'),
      timezone: '(GMT-06:00) America/Chicago',
      distance: 1609.34, // 1 mile, in meters
    })
    await RunModel.create({
      userId: user._id,
      name: 'Test Run 2',
      startDate: new Date('2022-10-11T23:07:39Z'),
      startDateLocal: new Date('2022-10-11T17:07:39Z'),
      timezone: '(GMT-06:00) America/Chicago',
      distance: 3218.69, // 2 miles, in meters
    })
    await RunModel.create({
      userId: user._id,
      name: 'Test Run 3',
      startDate: new Date('2022-10-17T23:07:39Z'),
      startDateLocal: new Date('2022-10-17T17:07:39Z'),
      timezone: '(GMT-06:00) America/Chicago',
      distance: 1609.34, // 1 mile, in meters
    })

    // Matching DailyStats objects for the runs
    await DailyStatsModel.create({
      userId: user._id,
      date: '2022-10-10',
      distance: 1609.34,
    })
    await DailyStatsModel.create({
      userId: user._id,
      date: '2022-10-11',
      distance: 3218.69,
    })
    // Matching DailyStats objects for the runs
    await DailyStatsModel.create({
      userId: user._id,
      date: '2022-10-17',
      distance: 1609.34,
    })

    // Request to create 1-week training plan during week of the runs
    const req = {
      user: {
        id: user._id,
      },
      body: {
        startDate: '2022-10-10',
        endDate: '2022-10-23',
        weekCount: 2,
        timezone: 'America/Denver',
        title: 'Training Plan 1',
        goal: 'Create training plans without bugs :)',
        isActive: false,
      }
    }

    const res = { 
      status: jest.fn(),
      json: jest.fn(),
    }

    // Make the plan
    await createTrainingPlan(req, res)
    const plan1 = await TrainingModel.findOne({title: 'Training Plan 1'}).exec()

    expect(plan1.actualDistance).toBe(6437.37) // 4 miles (in meters)
  })
})
