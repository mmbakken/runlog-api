import RunModel from '../db/RunModel.js'

// Returns the logged in user's runs from the database.
const getRuns = async (req, res) => {
  const runs = await RunModel.find({ userId: req.user.id }).lean()

  res.json(runs)
  return
}

export default getRuns
