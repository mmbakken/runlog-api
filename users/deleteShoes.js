import UserModel from '../db/UserModel.js'

// Removes the given run from the database
const deleteShoes = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id)

    if (user == null) {
      console.error('Cannot delete shoes: user was not found.')
      return res.sendStatus(404)
    }

    if (req.params.shoeId == null) {
      console.error('Cannot delete shoes: req.params.shoeId is required.')
      return res.sendStatus(404)
    }

    // For each shoe, add it to the new shoes array if it's not this one
    const newShoes = []
    for (let shoes of user.gear.shoes) {
      if (shoes._id.toString() !== req.params.shoeId) {
        newShoes.push(shoes)
      }
    }

    if (newShoes.length === user.gear.shoes.length) {
      const message = `Cannot delete shoe: Shoes with id "${req.params.shoeId}" were not found in the user's shoe list.`
      console.error(message)
      return res.status(404).json({ message: message})
    }

    user.gear.shoes = newShoes
    await user.save()

    console.log(`Deleted shoes from user "${req.user.id}", with shoe id "${req.params.shoeId}"`)

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      hasFitbitAuth: user.hasFitbitAuth || false,
      hasStravaAuth: user.hasStravaAuth || false,
      stats: user.stats,
      gear: user.gear,
    })
  } catch (e) {
    console.error(`Error while trying to delete shoes with id "${req.params.shoeId}". Aborting delete action.`)
    console.dir(e)

    return res.sendStatus(500)
  }
}

export default deleteShoes
