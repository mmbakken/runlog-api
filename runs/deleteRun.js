import mongoose from 'mongoose'
import RunModel from '../db/RunModel.js'

import resetDailyStats from '../dailyStats/resetDailyStats.js'
import updatePlansFromRun from './updatePlansFromRun.js'

// Removes the given run from the database
const deleteRun = async (req, res) => {
  try {
    const run = await RunModel.findById(req.params.id).lean()

    if (run == null) {
      console.error(`Cannot delete run with id "${req.params.id}": id was not found.`)
      return res.sendStatus(404)
    }

    await RunModel.deleteOne({_id: mongoose.Types.ObjectId(req.params.id)})
    console.log(`Deleted run with id "${req.params.id}"`)

    // Correct the distances in DS now that run is deleted
    await resetDailyStats(req.user)

    // Update the plan distances once DS is correct.
    await updatePlansFromRun(run, req.user, false)

    return res.json(run)
  } catch (e) {
    console.error(`Error while trying to delete run with id "${req.params.id}". Aborting delete action.`)
    console.dir(e)

    return res.sendStatus(500)
  }
}

export default deleteRun
