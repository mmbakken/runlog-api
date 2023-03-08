import mongoose from 'mongoose'
import RunModel from '../db/RunModel.js'
import UserModel from '../db/UserModel.js'
import { jest, describe, expect, beforeAll, beforeEach, afterEach, afterAll, test } from '@jest/globals'

import deleteShoes from './deleteShoes.js'

beforeAll(async () => {
  // Set up test DB
  try {
    await mongoose.connect('mongodb://localhost/deleteShoes', {
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
  test('Delete shoes that were attached to a run', async () => {
    let user = await UserModel.create({
      name: 'Vlad',
      email: 'lenin@gmail.com',
      gear: {
        shoes: [
          {
            _id: mongoose.Types.ObjectId(),
            title: 'First shoe',
            distance: 0,
            runIds: [],
          },
        ],
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

    user.gear.shoes = [
      {
        _id: user.gear.shoes[0]._id,
        title: 'First shoe',
        distance: run.distance,
        runIds: [run._id],
      }
    ]

    await user.save()

    run.shoeId = user.gear.shoes[0]._id
    run.save()

    const req = {
      user: user,
      params: {
        shoeId: user.gear.shoes[0]._id.toString()
      }
    }

    const res = {
      sendStatus: jest.fn,
      json: jest.fn,
    }

    await deleteShoes(req, res)
    user = await UserModel.findOne({}).exec()
    run = await RunModel.findOne({}).exec()

    expect(user.gear.shoes.length).toBe(0)
    expect(run.shoeId).toBeNull()
  })
})
