import connectToMongo from '../db/connectToMongo.js'
import RunModel from '../db/RunModel.js'

// This script adds user-editable fields to every run object and sets their default values.

const addUserEditableFields = async () => {
  connectToMongo()

  try {
    const result = await RunModel.updateMany(
      {}, // all runs
      {
        $set: {
          shoes: null, // string
          ice: false, // boolean
          stretch: false, // boolean
          strength: null, // string
          results: null, // string
        },
        $currentDate: { lastModified: true },
      }
    )

    console.log(`${result.n} runs found, ${result.nModified} updated.`)

    return
  } catch (err) {
    console.error(err)
  }
}

addUserEditableFields()
