import TrainingModel from '../db/TrainingModel.js'

const updateTrainingPlan = async (req, res) => {
  let training

  try {
    training = await TrainingModel.findById(req.params.id)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }

  if (training == null) {
    console.error(`training with id "${req.params.id}" was not found.`)
    return res.sendStatus(404)
  }

  if (req.body == null || req.body.updates == null) {
    console.error(`Cannot update training with id "${training._id}": Must include req.body.updates.`)
    return res.sendStatus(400)
  }

  // Update the training with new values
  const validFields = Object.keys(TrainingModel.schema.paths)
  for (let [field, value] of Object.entries(req.body.updates)) {
    if (!validFields.includes(field)) {
      console.error(`Cannot update training with id "${training._id}": Field "${field}" is not present in the document`)
      return res.sendStatus(400)
    }

    training[field] = value
  }

  try {
    await training.save()
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }

  return res.json(training.toObject())
}

export default updateTrainingPlan
