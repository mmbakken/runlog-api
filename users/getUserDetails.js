import UserModel from '../db/UserModel.js'

// Returns more user fields to the client if they're already authenticated.
// This is useful for refreshing the user data on the client if it has recently changed.

const getUserDetails = async (req, res) => {
  // Can't rely on the JWT for the user ID since some users can request OTHER user's records
  if (req.params.id == null) {
    console.error('Unable to provide user details: id missing in route params.')
    return res.sendStatus(400)
  }

  // Make sure the authenticated user is the one whose details are being requested
  if (req.user.id !== req.params.id) {
    // TODO: allow admin users to skip this check
    console.error(`User with id "${req.user.id} is forbidden from accessing user details for user id: "${req.params.id}"`)
    return res.sendStatus(403)
  }

  try {
    // Look up user by email in mongo
    const user = await UserModel.findById(req.user.id)

    if (user == null) {
      console.error(`Unable to find user with id "${req.user.id}"`)
      return res.sendStatus(400)
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      hasFitbitAuth: user.hasFitbitAuth || false,
      hasStravaAuth: user.hasStravaAuth || false,
      stats: user.stats,
      gear: user.gear,
    })
  } catch (err) {
    console.error(err)
    return res.sendStatus(500)
  }
}

export default getUserDetails
