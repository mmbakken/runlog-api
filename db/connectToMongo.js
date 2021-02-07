import mongoose from 'mongoose'

// Connect to the database. This happens async behind the scenes, but Mongoose will batch
// up any queries we make until this is successful. Also handles closing the db when the
// app is done.
const connectToMongo = () => {
  // Build the connection string 
  const dbURI = 'mongodb://localhost/runlog' 

  mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  mongoose.connection.on('connected', () => {
    console.log('Mongoose default connection open to ' + dbURI)
  }) 

  mongoose.connection.on('error', (err) => {
    console.error('Mongoose default connection error: ' + err)
  }) 

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose default connection disconnected') 
  })

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose default connection disconnected through app termination') 
      process.exit(0) 
    })
  })
}

export default connectToMongo
