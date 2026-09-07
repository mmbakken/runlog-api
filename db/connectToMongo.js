import mongoose from 'mongoose'
import disconnectFromMongo from './disconnectFromMongo.js'

// Logging helper. Don't log anything in test environments.
// `logger` - optional function. Defaults to `console.log`.
const log = (message, logger) => {
  // See Jest docs for this string's origin:
  // https://jestjs.io/docs/environment-variables#node_env
  if (process.env.NODE_ENV !== 'test') {
    if (logger == null) {
      console.log(message)
    } else {
      logger(message)
    }
  }
}

// Connect to the database. This happens async behind the scenes, but Mongoose
// will batch up any queries we make until this is successful. Also handles
// closing the db when the app is done.
// dbStr - String, optional.
const  connectToMongo = async dbStr => {
  // Which MongoDB database to use? Defaults to 'runlog' (prod and localhost) if not specified.
  let dbName = dbStr
  if (dbName == null || typeof dbName !== 'string' || dbName.length === 0) {
    dbName = 'runlog'
  }

  mongoose.connection.on('connected', () => {
    log('Mongoose default connection open to ' + dbURI)
  })

  mongoose.connection.on('error', err => {
    log('Mongoose default connection error: ' + err, console.error)
  })

  mongoose.connection.on('disconnected', () => {
    log('Mongoose default connection disconnected')
  })

  // Build the connection string
  const dbURI = `mongodb://127.0.0.1:27017/${dbName}`

  await mongoose.connect(dbURI)

  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', () => {
    disconnectFromMongo()
  })
}

export default connectToMongo
