import mongoose from 'mongoose'
import RunModel from '../db/RunModel.js'
import UserModel from '../db/UserModel.js'
import { jest, describe, expect, beforeAll, beforeEach, afterEach, afterAll, test } from '@jest/globals'

import updateUserShoeList from './updateUserShoeList.js'

beforeAll(async () => {
  // Set up test DB
  try {
    await mongoose.connect('mongodb://localhost/updateUserShoeList', {
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
  await UserModel.deleteMany()
  await RunModel.deleteMany()
})

afterAll(async () => {
  // Tear down test DB
  return await mongoose.connection.close()
})

describe('User can add a shoes to a run', () => {
  test('Add shoes to a single run', async () => {
    let user = await UserModel.create({
      name: 'Vlad',
      email: 'lenin@gmail.com',
      gear: {
        shoes: [{
          _id: mongoose.Types.ObjectId(),
          title: 'First shoe',
          distance: 0,
          runIds: [],
        }],
      }
    })

    let run = await RunModel.create({
      userId: user._id,
      name: 'Test Run 2',
      startDate: new Date('2022-10-16T23:07:39Z'),
      startDateLocal: new Date('2022-10-16T17:07:39Z'),
      timezone: '(GMT-06:00) America/Chicago',
      distance: 1609.34, // 1 mile, in meters
      shoeId: null,
    })

    await updateUserShoeList(user._id, user.gear.shoes[0]._id.toString(), run.shoeId, run._id, run.distance)
    user = await UserModel.findOne({}).exec()

    expect(user.gear.shoes[0].distance).toBe(1609.34) // 1 mile, in meters
    expect(user.gear.shoes[0].runIds.length).toBe(1)
  })

  test('Add shoes to two runs', async () => {
    let user = await UserModel.create({
      name: 'Vlad',
      email: 'lenin@gmail.com',
      gear: {
        shoes: [{
          title: 'First shoe',
          distance: 0,
          runIds: [],
        }],
      }
    })

    let run1 = await RunModel.create({
      userId: user._id,
      name: 'Test Run 2',
      startDate: new Date('2022-10-16T23:07:39Z'),
      startDateLocal: new Date('2022-10-16T17:07:39Z'),
      timezone: '(GMT-06:00) America/Chicago',
      distance: 1609.34, // 1 mile, in meters
      shoeId: null,
    })

    let run2 = await RunModel.create({
      userId: user._id,
      name: 'Test Run 2',
      startDate: new Date('2022-10-16T23:07:39Z'),
      startDateLocal: new Date('2022-10-16T17:07:39Z'),
      timezone: '(GMT-06:00) America/Chicago',
      distance: 1609.34, // 1 mile, in meters
      shoeId: null,
    })

    await updateUserShoeList(user._id, user.gear.shoes[0]._id.toString(), run1.shoeId, run1._id, run1.distance)
    await updateUserShoeList(user._id, user.gear.shoes[0]._id.toString(), run2.shoeId, run2._id, run2.distance)
    user = await UserModel.findOne({}).exec()

    expect(user.gear.shoes[0].distance).toBe(3218.68) // 2 miles, in meters
    expect(user.gear.shoes[0].runIds.length).toBe(2)
  })

  test('Change shoes for a run', async () => {
    let user = await UserModel.create({
      name: 'Vlad',
      email: 'lenin@gmail.com',
      gear: {
        shoes: [
          {
            title: 'First shoe',
            distance: 0,
            runIds: [],
          },
          {
            title: 'Second shoe',
            distance: 0,
            runIds: [],
          },
        ],
      }
    })

    let run1 = await RunModel.create({
      userId: user._id,
      name: 'Test Run 2',
      startDate: new Date('2022-10-16T23:07:39Z'),
      startDateLocal: new Date('2022-10-16T17:07:39Z'),
      timezone: '(GMT-06:00) America/Chicago',
      distance: 1609.34, // 1 mile, in meters
      shoeId: null,
    })

    // Set the runId and distance correctly
    UserModel.updateOne(
      {
        _id: user._id
      },
      {
        gear: {
          shoes: [
            {
              _id: user.gear.shoes[0]._id,
              title: 'First shoe',
              distance: run1.distance,
              runIds: [run1._id],
            },
            {
              _id: user.gear.shoes[1]._id,
              title: 'Second shoe',
              distance: 0,
              runIds: [],
            },
          ]
        }
      }
    )

    await updateUserShoeList(user._id, user.gear.shoes[1]._id.toString(), run1.shoeId, run1._id, run1.distance)
    user = await UserModel.findOne({}).exec()

    expect(user.gear.shoes[0].distance).toBe(0)
    expect(user.gear.shoes[0].runIds.length).toBe(0)
    expect(user.gear.shoes[1].distance).toBe(1609.34) // 1 mile, in meters
    expect(user.gear.shoes[1].runIds.length).toBe(1)
  })

  test('Delete shoes being used by a run', async () => {
    let user = await UserModel.create({
      name: 'Vlad',
      email: 'lenin@gmail.com',
      gear: {
        shoes: [
          {
            title: 'First shoe',
            distance: 0,
            runIds: [],
          },
        ],
      }
    })

    let run1 = await RunModel.create({
      userId: user._id,
      name: 'Test Run 2',
      startDate: new Date('2022-10-16T23:07:39Z'),
      startDateLocal: new Date('2022-10-16T17:07:39Z'),
      timezone: '(GMT-06:00) America/Chicago',
      distance: 1609.34, // 1 mile, in meters
      shoeId: null,
    })

    // Set the runId and distance correctly
    UserModel.updateOne(
      {
        _id: user._id
      },
      {
        gear: {
          shoes: [
            {
              _id: user.gear.shoes[0]._id,
              title: 'First shoe',
              distance: run1.distance,
              runIds: [run1._id],
            },
          ]
        }
      }
    )

    await updateUserShoeList(user._id, null, run1.shoeId, run1._id, run1.distance)
    user = await UserModel.findOne({}).exec()

    expect(user.gear.shoes[0].distance).toBe(0)
    expect(user.gear.shoes[0].runIds.length).toBe(0)
  })
})
