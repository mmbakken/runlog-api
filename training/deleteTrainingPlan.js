import TrainingModel from '../db/TrainingModel.js'

// Returns the logged in user's training plans from the database.
const deleteTrainingPlan = async (req, res) => {
  let deletedPlan

  try {
    deletedPlan = await TrainingModel.deleteOne({ _id: req.params.id })
  } catch (e) {
    return res.status(501).json({ error: 'Unable to delete training plan' })
  }

  return res.status(200).json(deletedPlan)
}

export default deleteTrainingPlan
