import RunModel from '../db/RunModel.js'

// Returns the logged in user's runs from the database.
const getAllRuns = async (req, res) => {
  if (req.user == null || req.user._id == null) {
    console.error('UserId is required for this route')
    return res.sendStatus(400)
  }

  const runsArray = await RunModel.find({ userId: req.user._id }).lean()

  // Turn it into a map like {runId: {runField1: runValue1, ... }} so it's easier to lookup a single
  // run object, update it, etc.
  const runMap = {}
  for (let run of runsArray) {
    runMap[run._id] = {
      ...run
    }
  }

  res.json(runMap)
  return
}

export default getAllRuns
