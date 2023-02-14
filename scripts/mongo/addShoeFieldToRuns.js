import connectToMongo from '../../db/connectToMongo.js'
import disconnectFromMongo from '../../db/disconnectFromMongo.js'
import RunModel from '../../db/RunModel.js'

const addShoeFieldToRuns = async () => {
  connectToMongo()

  // Get each run document and set the shoeId field to null
  try {
    const allRuns = await RunModel.find(
      { }, // all runs
      '_id'
    )

    let nModified = 0
    for (let i = 0; i < allRuns.length; i++) {
      let run = allRuns[i]

      // No shoes set for any existing runs. User can select this later.
      run.shoeId = null

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

addShoeFieldToRuns()
