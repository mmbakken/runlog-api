import TrainingModel from '../db/TrainingModel.js'

// Returns the logged in user's training plans from the database.
const getTrainingPlan = async (req, res) => {
  const plan = await TrainingModel.findById(req.params.id).lean()

  if (plan == null) {
    console.error(`Training plan with id "${req.params.id}" was not found.`)
    return res.sendStatus(404)
  }

  return res.json(plan)
}

export default getTrainingPlan
