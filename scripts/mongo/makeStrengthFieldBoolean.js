import connectToMongo from '../db/connectToMongo.js'
import RunModel from '../db/RunModel.js'

// This script changes run.strength into a boolean field, instead of a string.
const makeStrengthFieldBoolean = async () => {
  connectToMongo()

  try {
    const result = await RunModel.updateMany(
      { }, // all runs
      {
        $set: {
          strength: false, // used to be a string
        },
        $currentDate: { lastModified: true }
      }
    )

    console.log(`${result.n} runs found, ${result.nModified} updated.`)

    return
  } catch (err) {
    console.error(err)
  }
}

makeStrengthFieldBoolean()
