import TrainingModel from '../db/TrainingModel.js'

// Returns the logged in user's training plans from the database.
const getAllTrainingPlans = async (req, res) => {
  const trainingPlans = await TrainingModel.find({ userId: req.user.id }).lean()

  // Turn it into a map like {trainingId: {trainingField1: trainingValue1, ... }} so it's easier to
  // lookup a single training plan object, update it, etc.
  const trainingPlansMap = {}
  for (let training of trainingPlans) {
    trainingPlansMap[training._id] = {
      ...training
    }
  }

  res.json(trainingPlansMap)
  return
}

export default getAllTrainingPlans
