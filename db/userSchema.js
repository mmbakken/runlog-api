import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  fitbitAccessToken: String,
  fitbitRefreshToken: String,
})

export default userSchema
