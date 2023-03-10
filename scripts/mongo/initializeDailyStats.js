import connectToMongo from '../../db/connectToMongo.js'
import disconnectFromMongo from '../../db/disconnectFromMongo.js'
import UserModel from '../../db/UserModel.js'
import resetDailyStats from '../../dailystats/resetDailyStats.js'

// This script adds documents to the DailyStats collection based on the existing run data

// For each user, for each unique date that a run occured on
const initializeDailyStats = async () => {
  connectToMongo()

  // For each user, find all of their runs.
  // Then generate a dailyStats document for each unique date that a run occurred on.
  // Populate the distance totals and runIds for that date's runs.

  // Find all users
  let allUsers
  try {
    allUsers = await UserModel.find(
      {}, // all users
      '_id stats'
    ).lean()
  } catch (err) {
    console.error(err)
  }

  console.log(`Found users: ${allUsers}`)

  // For each user, for each unique day with a run, add a DailyStats document.
  for (let i = 0; i < allUsers.length; i++) {
    try {
      await resetDailyStats(allUsers[i], true)
    } catch (err) {
      console.error(err)
    }
  }

  disconnectFromMongo()
}

initializeDailyStats()
