import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import UserModel from '../db/UserModel.js'

// This script will add a user to the database with an encrypted password

const userData = {
  email: 'mmbakken@gmail.com',
  name: 'Matt Bakken',
  password: 'majora6669',
}


// Connect mongoose to the database
mongoose.connect('mongodb://localhost/runlog', {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

try {
  db.once('open', async () => {
    // Log all existing user records
    console.log('Existing users:')
    console.log(await UserModel.find())

    if (await UserModel.exists({ email: userData.email })) {
      console.error(`Cannot add new user with email "${userData.email}": user already exists.`)
      db.close()
      return
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const user = new UserModel({ ...userData, password: hashedPassword })

    console.log('New user:')
    console.log(user.inspect())

    await user.save()

    db.close()
    return
  })
} catch (err) {
  console.error(err)
  db.close()
}
