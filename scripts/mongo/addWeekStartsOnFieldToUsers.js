// A script to add the `weekStartsOn` field to each existing User document
import mongoose from 'mongoose'
import connectToMongo from '../../db/connectToMongo.js'
import UserModel from '../../db/UserModel.js'

const addWeekStartsOnFieldToUsers = async () => {
  connectToMongo()

  try {
    const result = await UserModel.updateMany(
      { }, // all users
      {
        stats: {
          weekStartsOn: 1,
        }
      }
    )

    console.log(`${result.n} users found, ${result.nModified} updated.`)
    return
  } catch (err) {
    console.error(err)
  }

  mongoose.connection.close()
}

addWeekStartsOnFieldToUsers()
