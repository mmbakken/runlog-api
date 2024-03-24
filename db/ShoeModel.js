import mongoose from 'mongoose'

const shoeSchema = new mongoose.Schema({
  userId: mongoose.ObjectId,
  title: String,
  runIds: [mongoose.ObjectId],
  distance: Number, // In meters, like runs are
})

export default mongoose.model('Shoes', shoeSchema)
