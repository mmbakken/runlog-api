import connectToMongo from '../../db/connectToMongo.js'
import disconnectFromMongo from '../../db/disconnectFromMongo.js'
import RunModel from '../../db/RunModel.js'
import generateTitle from '../../runs/generateTitle.js'

// This script is used to fix runs titled "Evening Run" by a bug introduced in November 2021 and
// fixed on March 29, 2022. It correctly titles the runs which were not already renamed.

// ... So this script was buggy too. It assumed run.startDate was an ISO date, but it's a JS Date

// Main function call for script
const fixEveningRunTitles = async () => {
  connectToMongo()

  // Get each run document with a (possibly) bad title, figure out the correct title using startTime and timezone, save run
  try {
    const allRuns = await RunModel.find(
      {
        title: 'Run'
      },
      '_id timezone startDate'
    )

    // Add the correct title field to this run document
    let nModified = 0
    for (let i = 0; i < allRuns.length; i++) {
      let run = allRuns[i]
      const dateStr = new Date(run._doc.startDate).toISOString()
      run.title = generateTitle(dateStr, run._doc.timezone.split(' ')[1])

      try {
        await run.save()
        nModified++
      } catch (err) {
        console.error(err)
      }
    }

    console.log(`${allRuns.length} runs found with 'Evening Run' title, ${nModified} updated to correct title.`)
  } catch (err) {
    console.error(err)
  } finally {
    disconnectFromMongo()
  }
}

fixEveningRunTitles()
