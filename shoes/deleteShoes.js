import mongoose from 'mongoose'
import ShoeModel from '../db/ShoeModel.js'

// Removes the given shoe from the database
const deleteShoes = async (req, res) => {
  try {
    const shoe = await ShoeModel.findById(req.params.id).lean()

    if (shoe == null) {
      console.error(
        `Cannot delete shoe with id "${req.params.id}": id was not found.`
      )
      return res.sendStatus(404)
    }

    await ShoeModel.deleteOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
    })

    console.log(`Deleted shoe with id "${req.params.id}"`)

    return res.json(shoe)
  } catch (e) {
    console.error(
      `Error while trying to delete shoe with id "${req.params.id}". Aborting delete action.`
    )
    console.dir(e)

    return res.sendStatus(500)
  }
}

export default deleteShoes
