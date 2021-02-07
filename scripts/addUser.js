import bcrypt from 'bcrypt'
import connectToMongo from '../db/connectToMongo.js'
import UserModel from '../db/UserModel.js'

// This script will add a user to the database with an encrypted password
const userData = {
  email: 'mmbakken@gmail.com',
  name: 'Matt Bakken',
  password: 'goosethedog',
}

const addUser = async (userData) => {
  connectToMongo()

  try {
    // Log all existing user records
    console.log('Existing users:')
    console.log(await UserModel.find({}, 'email'))

    if (await UserModel.exists({ email: userData.email })) {
      console.error(`Cannot add new user with email "${userData.email}": user already exists.`)
      return
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const user = new UserModel({ ...userData, password: hashedPassword })

    console.log('New user:')
    console.log(user.inspect())

    await user.save()

    return
  } catch (err) {
    console.error(err)
  }
}

addUser(userData)
