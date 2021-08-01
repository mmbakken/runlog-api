import connectToMongo from '../../db/connectToMongo.js'
import RunModel from '../../db/RunModel.js'
import { DateTime } from 'luxon'

// This script adds a string field `title` to all run objects. The value is added to each existing
// run based on the same logic (at time of writing) as used in the RunPage.js component.

// Given a run, returns a title string to use, based on the time of day
const generateTitle = (runStartTime, timezone) => {
  const dt = DateTime.fromJSDate(runStartTime, { zone: timezone })

  console.dir(runStartTime)
  console.dir(timezone)

  // Thresholds
  const startOfMorning = dt.set({ hour: 4, minute: 0, second: 0 })
  const startOfAfternoon = dt.set({ hour: 12, minute: 0, second: 0 })
  const startOfEvening = dt.set({ hour: 17, minute: 0, second: 0 })
  const startOfLateNight = dt.set({ hour: 22, minute: 0, second: 0 })

  console.log('dt:')
  console.dir(dt)
  console.log('~~~~~')
  console.dir(startOfMorning)
  console.dir(startOfAfternoon)
  console.dir(startOfEvening)
  console.dir(startOfLateNight)

  if (dt < startOfMorning || dt >= startOfLateNight) {
    return 'Late Night Run'
  } else if (dt < startOfAfternoon) {
    return 'Morning Run'
  } else if (dt < startOfEvening) {
    return 'Afternoon Run'
  } else {
    return 'Evening Run'
  }
}

// Main function call for script
const addTitleFieldToRuns = async () => {
  connectToMongo()

  // Get each run document, figure out the correct title using startTime and timezone, save run

  try {
    const allRuns = await RunModel.find(
      { }, // all runs
      '_id timezone startDate'
    )

    // Add the title field to this run document
    let nModified = 0
    for (let i = 0; i < allRuns.length; i++) {
      let run = allRuns[i]

      run.title = generateTitle(run._doc.startDate, run._doc.timezone.split(' ')[1]) // used to be a string

      try {
        await run.save()
        nModified++
      } catch (err) {
        console.error(err)
      }
    }

    console.log(`${allRuns.length} runs found, ${nModified} updated.`)

    return
  } catch (err) {
    console.error(err)
  }
}

addTitleFieldToRuns()
