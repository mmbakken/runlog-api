import ShoeModel from '../db/ShoeModel.js'

// Creates new shoes for the current user.
const createShoes = async (req, res) => {
  // Parse the required and optional fields, then validate them
  const title = req.body.title // ISO Date like yyyy-mm-dd

  if (title == null || typeof title !== 'string') {
    return res
      .status(400)
      .json({ error: 'Unable to create training plan: title must be a string' })
  }

  if (req.user == null || req.user._id == null) {
    return res
      .status(500)
      .json({ error: 'Unable to add shoes: user not found.' })
  }

  try {
    const newShoe = new ShoeModel({
      userId: req.user._id,
      title: title,
      runIds: [],
      distance: 0,
    })

    await newShoe.save()
    res.json(newShoe)
    return
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Unable to create shoes.',
      error: err,
    })
  }
}

export default createShoes
