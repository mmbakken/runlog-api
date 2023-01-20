import mongoose from 'mongoose'
import TrainingModel from '../db/TrainingModel.js'

// Returns the logged in user's training plans from the database.
const getTrainingPlan = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.sendStatus(404)
  }

  try {
    const plan = await TrainingModel.findById(req.params.id).lean()

    if (plan == null) {
      console.error(`Training plan with id "${req.params.id}" was not found.`)
      return res.sendStatus(404)
    }

    return res.json(plan)
  } catch (e) {
    console.error(`Error while trying to get training plan with id "${req.params.id}"`)
    console.dir(e)

    return res.sendStatus(500)
  }
}

export default getTrainingPlan
