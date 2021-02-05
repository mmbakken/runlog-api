import connectToMongo from '../db/connectToMongo.js'
import RunModel from '../db/RunModel.js'

// Returns the logged in user's runs from the database.
const getRuns = async (req, res) => {
  const db = await connectToMongo()
  const runs = await RunModel.find({ userId: req.user.id }).lean()

  res.json(runs)
  db.close()
  return
}

export default getRuns
