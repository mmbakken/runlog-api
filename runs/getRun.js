import mongoose from 'mongoose'
import RunModel from '../db/RunModel.js'

// Returns the logged in user's runs from the database.
const getRun = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.sendStatus(404)
  }

  try {
    const run = await RunModel.findById(req.params.id).lean()

    if (run == null) {
      console.error(`Run with id "${req.params.id}" was not found.`)
      return res.sendStatus(404)
    }

    return res.json(run)
  } catch (e) {
    console.error(`Error while trying to get run with id "${req.params.id}"`)
    console.dir(e)

    return res.sendStatus(500)
  }
}

export default getRun
