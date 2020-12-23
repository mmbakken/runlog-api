import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import userSchema from '../db/userSchema.js'

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
    const User = mongoose.model('User', userSchema)

    // Log all existing user records
    console.log('Existing users:')
    console.log(await User.find())

    if (await User.exists({ email: userData.email })) {
      console.error(`Cannot add new user with email "${userData.email}": user already exists.`)
      db.close()
      return
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const user = new User({ ...userData, password: hashedPassword })

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
