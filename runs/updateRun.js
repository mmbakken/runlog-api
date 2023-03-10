import RunModel from '../db/RunModel.js'
import DailyStatsModel from '../db/DailyStatsModel.js'

import updateUserShoeList from './updateUserShoeList.js'

// Given a run id and a map of {field: value} pairs of updates, the run document will have the
// changes applied.
//
// Will return a 400 status if the field does not exist for this run document. This is a strictly
// update-only action, not upsert.
const updateRun = async (req, res) => {
  let run

  try {
    run = await RunModel.findById(req.params.id)
  } catch (error) {
    console.error(error)
    return res.sendStatus(500)
  }

  if (run == null) {
    console.error(`Run with id "${req.params.id}" was not found.`)
    return res.sendStatus(404)
  }

  if (req.body == null || req.body.updates == null) {
    console.error(`Cannot update run with id "${run._id}": Must include req.body.updates.`)
    return res.sendStatus(400)
  }

  // Update the fields specified by the user's request. See req.body.updates for syntax.
  const validFields = Object.keys(RunModel.schema.paths)
  for (let [field, value] of Object.entries(req.body.updates)) {
    if (!validFields.includes(field)) {
      console.error(`Cannot update run with id "${run._id}": Field "${field}" is not present in the document`)
      return res.sendStatus(400)
    }

    const currentValue = run[field]
    run[field] = value

    // Do we need to update the DailyStats for this date too?
    if (field === 'title') {
      try {
        await DailyStatsModel.update(
          {
            userId: req.user._id,
            runIds: {
              $eq: [run._id] // Only this run ID - otherwise title is still "multiple runs"
            }
          },
          {
            title: run.title
          }
        )
      } catch (error) {
        console.error(`Error while attempting to update DailyStats for run with id "${run._id}"`)
        return res.sendStatus(500)
      }
    }

    // Update the user's shoe distance if the shoe was added to the run for the first time.
    if (field === 'shoeId') {
      try {
        await updateUserShoeList(req.user._id, value, currentValue, run._id, run.distance)
      } catch (err) {
        console.error(`Error while attempting to update user shoe list for run with id "${run._id}"`)
        console.dir(err)
        return res.sendStatus(500)
      }
    }
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
