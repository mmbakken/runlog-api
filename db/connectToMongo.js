import mongoose from 'mongoose'

// Returns the Mongoose db object
const connectToMongo = () => {
  return new Promise((resolve, reject) => {
    // Connect to DB
    // Connect mongoose to the database

    try {
      console.log('Trying to connect to Mongoose...')

      mongoose.connect(
        'mongodb://localhost/runlog',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      )

      const db = mongoose.connection

      // Handles errors after connection
      db.on('error', () => {
        return reject(new Error(console.error.bind(console, 'connection error:')))
      })

      db.once('open', () => {
        console.log('Connected to Mongoose')
        return resolve(db)
      })
    } catch (error) {
      return reject(new Error('Unable to connect to Mongoose'))
    }
  })
}

export default connectToMongo
