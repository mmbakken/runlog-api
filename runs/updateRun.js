import RunModel from '../db/RunModel.js'

// Given a run id and a map of {field: value} pairs of updates, the run document will have the
// changes applied.
//
// Will return a 400 status if the field does not exist for this run document. This is a strictly
// update-only action, not upsert.
const updateRun = async (req, res) => {
  let run

  try {
    run = await RunModel.findById(req.params.runId)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }

  if (run == null) {
    console.error(`Run with id "${req.params.runId}" was not found.`)
    return res.sendStatus(404)
  }

  if (req.body == null || req.body.updates == null) {
    console.error(`Cannot update run with id "${run._id}": Must include req.body.updates.`)
    return res.sendStatus(400)
  }

  // Update the run with 
  const validFields = Object.keys(RunModel.schema.paths)
  for (let [field, value] of Object.entries(req.body.updates)) {
    if (!validFields.includes(field)) {
      console.error(`Cannot update run with id "${run._id}": Field "${field}" is not present in the document`)
      return res.sendStatus(400)
    }

    run[field] = value
  }

  try {
    await run.save()
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }

  return res.json(run.toObject())
}

export default updateRun
