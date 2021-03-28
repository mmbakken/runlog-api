import mongoose from 'mongoose'

// Allows scripts to close to the Mongo connection and end.
const disconnectFromMongo = () => {
  mongoose.connection.close(() => {
    console.log('Mongoose default connection disconnected intentionally.') 
    process.exit(0) 
  })
}

export default disconnectFromMongo
