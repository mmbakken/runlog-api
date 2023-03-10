import UserModel from '../db/UserModel.js'

// Creates new shoes for this user, saves it to the database, and returns the new user object
const createShoes = async (req, res) => {
  // Parse the required and optional fields, then validate them
  const title = req.body.title // ISO Date like yyyy-mm-dd

  if (title == null || typeof title !== 'string') {
    return res.status(400).json({ error: 'Unable to create training plan: title must be a string'})
  }

  if (req.user == null || req.user._id == null) {
    return res.status(500).json({ error: 'Unable to add shoes to user: user not found.' })
  }

  let newShoes = {
    title: title,
    runIds: [],
    distance: 0,
  }

  // Get the user object and add the shoes to it
  let user
  try {
    user = await UserModel.findById(req.user._id)

    if (user == null) {
      console.error(`Unable to find user with id "${req.user._id}"`)
      return res.sendStatus(400)
    }

    user.gear.shoes.push(newShoes)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Unable to add shoes to user.', error: e})
  }

  // Save to db
  try {
    user = await user.save()

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      hasFitbitAuth: user.hasFitbitAuth || false,
      hasStravaAuth: user.hasStravaAuth || false,
      stats: user.stats,
      gear: user.gear,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Unable to create training plan to database.', error: err})
  }
}

export default createShoes
