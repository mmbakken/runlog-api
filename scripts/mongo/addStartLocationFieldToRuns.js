import connectToMongo from '../../db/connectToMongo.js'
import disconnectFromMongo from '../../db/disconnectFromMongo.js'
import RunModel from '../../db/RunModel.js'
import generateLocation from '../../runs/generateLocation.js'

// This script adds a string field `startLocation` to all run objects. The value
// is added to each existing run based on the same logic (at time of writing) as
// used in the createRunFromStravaActivity function.

const addStartLocationFieldToRuns = async () => {
  connectToMongo()

  // Get each run document, figure out the correct location using startLatitude and startLongitude, save run.

  try {
    const allRuns = await RunModel.find(
      {}, // all runs
      '_id startLatitude startLongitude'
    )

    // Add the startLocation field to this run document
    let nModified = 0
    for (let i = 0; i < allRuns.length; i++) {
      let run = allRuns[i]

      run.startLocation = generateLocation(
        run._doc.startLatitude,
        run._doc.startLongitude
      )

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

addStartLocationFieldToRuns()
