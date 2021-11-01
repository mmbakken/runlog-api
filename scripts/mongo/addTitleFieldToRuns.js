import connectToMongo from '../../db/connectToMongo.js'
import disconnectFromMongo from '../../db/disconnectFromMongo.js'
import RunModel from '../../db/RunModel.js'
import generateTitle from '../../runs/generateTitle.js'

// This script adds a string field `title` to all run objects. The value is added to each existing
// run based on the same logic (at time of writing) as used in the RunPage.js component.

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
  } catch (err) {
    console.error(err)
  } finally {
    disconnectFromMongo()
  }
}

addTitleFieldToRuns()
