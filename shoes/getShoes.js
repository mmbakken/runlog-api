import ShoeModel from '../db/ShoeModel.js'

// Returns the logged in user's runs from the database.
const getShoes = async (req, res) => {
  if (req.user == null || req.user._id == null) {
    console.error('UserId is required for this route')
    return res.sendStatus(400)
  }

  const shoesArray = await ShoeModel.find({ userId: req.user._id }).lean()

  // Turn it into a map so it's easier to manage in the front end state.
  const shoeMap = {}
  for (let run of shoesArray) {
    shoeMap[run._id] = {
      ...run,
    }
  }

  res.json(shoeMap)
  return
}

export default getShoes
