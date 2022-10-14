import RunModel from '../db/RunModel.js'

// Returns the logged in user's runs from the database.
const getRun = async (req, res) => {
  const run = await RunModel.findById(req.params.id).lean()

  if (run == null) {
    console.error(`Run with id "${req.params.id}" was not found.`)
    return res.sendStatus(404)
  }

  return res.json(run)
}

export default getRun
