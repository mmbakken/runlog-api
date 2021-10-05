import connectToMongo from '../../db/connectToMongo.js'
import disconnectFromMongo from '../../db/disconnectFromMongo.js'
import UserModel from '../../db/UserModel.js'
import RunModel from '../../db/RunModel.js'
import DailyStatsModel from '../../db/DailyStatsModel.js'
import { DateTime } from 'luxon'

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
    let user = allUsers[i]
    const userId = user._id

    console.log(`Creating DailyStats for user: ${userId}`)
    console.dir(user)

    let allRuns
    try {
      allRuns = await RunModel.find(
        { userId: userId }, // all runs for this user
        '_id startDate timezone distance title'
      ).lean()
    } catch (err) {
      console.error(err)
    }

    console.log(`Found ${allRuns.length} runs for user`)

    // Add a DailyStats document for each unique date with a run, and populate the DailyStats fields
    // with correct distance totals and runIds
    let dailyStats = {}
    for (let j = 0; j < allRuns.length; j++) {
      let run = allRuns[j]

      // Timeone field has a weird format like "(GMT-07:00) America/Denver", just ignore the offset
      const tz = run.timezone.split(' ')[1]

      // Convert the run's full timestamp into a simpler yyyy-mm-dd date string
      const startDate = DateTime.fromJSDate(run.startDate, { zone: tz }).toISODate()

      // Is there is a DailyStats object with this run's startDate already?
      if (Object.keys(dailyStats).includes(startDate)) {
        // Add the distance to the existing distance for today
        dailyStats[startDate] = {
          ...dailyStats[startDate],
          distance: dailyStats[startDate].distance + run.distance,
          title: 'Multiple runs',
          runIds: [
            ...dailyStats[startDate].runIds,
            run._id
          ]
        }
      } else {
        // Make a new entry for this date and set the distance field appropriately
        dailyStats[startDate] = {
          userId: userId,
          date: startDate,
          distance: run.distance,
          title: run.title,
          runIds: [run._id],

          // Add these fields later when we know which dates exist and their daily distance totals
          sevenDayDistance: 0,
          weeklyDistance: 0,
        }
      }
    }

    // Determine 7day distance
    //   - Today's distance + all of the previous day's distances until 6 days ago (inclusive)
    // Determine weekly distance
    //   - Today's distance + all of the previous day's distances until the first day of the week (inclusive) as 
    //     determined by the user.stats.weekStartsOn field

    console.log(`User's week starts on: ${user.stats.weekStartsOn}`)
    console.log('~~~~~~~~~~~~~~~~~~~~~')

    // Using the existing daily distance totals, calculate the derivative distance fields
    const dates = Object.keys(dailyStats)
    for (let i = 0; i < dates.length; i++) {
      // "Current" date refers to the date whose 7day and weekly distances we want to find
      const currentDailyStats = dailyStats[dates[i]]
      const currentDate = DateTime.fromISO(currentDailyStats.date)
      let hitStartOfWeek = currentDate.weekday === user.stats.weekStartsOn // Set to true once first day of this week is found

      console.log(`DailyStats date: ${dates[i]}`)
      console.log(`weekday: ${currentDate.weekday}`)
      console.log('~~~~~~~~~~~~~~~~~~~~~')
      

      // Values we're trying to calculate
      currentDailyStats.sevenDayDistance = currentDailyStats.distance
      currentDailyStats.weeklyDistance = currentDailyStats.distance

      // Find the 6 previous days (-1 to -6) based on the current date we're looking at
      for (let dayOffset = 1; dayOffset <= 6; dayOffset++) {
        let date = currentDate.minus({ day: dayOffset })
        const dateStr = date.toISODate()

        console.log(`date: ${dateStr} / weekday: ${date.weekday}`)

        // Does a dailyStats record exist for this date?
        if (dailyStats[dateStr] != null) {
          // 7-day distance is just the sum of all distance for previous 6 days
          console.log('    adding to 7day total')
          currentDailyStats.sevenDayDistance += dailyStats[dateStr].distance

          // Have we hit the start of this week yet? If so, do not add this to the weekly distance
          if (!hitStartOfWeek) {
            console.log('    adding to weekly total')

            // Update the halting flag, then add this date's distance to the weekly sum.
            hitStartOfWeek = date.weekday === user.stats.weekStartsOn
            currentDailyStats.weeklyDistance += dailyStats[dateStr].distance
          }
        } else if (!hitStartOfWeek) {
          // Even if the dailyStats object doesn't exist, we should see if this date is the first
          // one of the week.
          hitStartOfWeek = date.weekday === user.stats.weekStartsOn
        }
      }
    }

    console.log('\n\n\n')

    console.log('Temp dailyStats object:')
    console.dir(dailyStats)

    // Insert the user's DailyStats documents to the collection
    try {
      // Bulk insert all of the DailyStats objects you made out of the runs
      await DailyStatsModel.insertMany(Object.values(dailyStats))
    } catch (err) {
      console.error(err)
    }
  }

  disconnectFromMongo()
}

initializeDailyStats()
