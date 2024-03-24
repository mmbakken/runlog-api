import mongoose from 'mongoose'

// Wrapper to close the Mongo connection.
const disconnectFromMongo = async () => {
  try {
    await mongoose.connection.close()
  } catch (err) {
    console.error('Something went wrong while disconnecting from Mongo:')
    console.dir(err)
  }
}

export default disconnectFromMongo
