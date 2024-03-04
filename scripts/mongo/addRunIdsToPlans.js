import connectToMongo from '../../db/connectToMongo.js'
import disconnectFromMongo from '../../db/disconnectFromMongo.js'
import { DateTime } from 'luxon'
import UserModel from '../../db/UserModel.js'
import RunModel from '../../db/RunModel.js'
import TrainingModel from '../../db/TrainingModel.js'

// This script adds a array field `runIds` to all plan objects. The value is added to each existing
// plan based on the same logic (at time of writing) as used in the RunPage.js component.

// Main function call for script
const addRunIdsToPlans = async () => {
  connectToMongo()

  try {
    // For each user
    // Get each training document, figure out the correct title using startTime and timezone, save run

    const allUsers = await UserModel.find({})

    for (let user of allUsers) {
      console.log(`User: "${user.name}"`)

      const plans = await TrainingModel.find({
        userId: user._id,
      })
      const runs = await RunModel.find({
        userId: user._id,
      }).lean()

      // Index the runs by date
      const runIdsByDate = {}
      let runISODate
      runs.map((run) => {
        runISODate = DateTime.fromJSDate(run.startDate, {
          zone: run.timezone.split(' ')[1],
        }).toISODate()

        if (runIdsByDate[runISODate] != null) {
          runIdsByDate[runISODate].push(run._id.toString())
        } else {
          runIdsByDate[runISODate] = [run._id.toString()]
        }
      })

      console.dir(runIdsByDate)

      // For every date in every plan, add a runIds field to the date in the plan.
      let nModified = 0
      let nPlanDatesModified = 0
      let isoDate
      for (let plan of plans) {
        for (let planDate of plan.dates) {
          nPlanDatesModified++
          planDate.runIds = []
          isoDate = DateTime.fromJSDate(planDate.dateISO, {
            zone: 'utc',
          }).toISODate()
          console.log(isoDate)

          // Add the runIds for this date to the plan's date object
          if (Object.keys(runIdsByDate).includes(isoDate)) {
            console.dir(runIdsByDate[isoDate])
            planDate.runIds = runIdsByDate[isoDate]
          }
        }

        try {
          await plan.save()
          nModified++
        } catch (err) {
          nPlanDatesModified = 0
          console.error(err)
        }
      }

      console.log(`${plans.length} plans found and ${nModified} plans updated.`)
      console.log(
        `${nPlanDatesModified} plan dates updated to include runIds array.`
      )
      console.log('~~~~~~~~~~~~~~~~~~~~~~~~')
    }
  } catch (err) {
    console.error(err)
  } finally {
    disconnectFromMongo()
  }
}

addRunIdsToPlans()
