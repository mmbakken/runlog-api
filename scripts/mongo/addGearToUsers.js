import connectToMongo from '../../db/connectToMongo.js'
import disconnectFromMongo from '../../db/disconnectFromMongo.js'
import UserModel from '../../db/UserModel.js'

const addGearToUsers = async () => {
  connectToMongo()

  // Get each user document and add a new object for tracking their gear (just shoes, for now)
  try {
    const allUsers = await UserModel.find(
      {}, // all runs
      '_id'
    )

    let nModified = 0
    for (let i = 0; i < allUsers.length; i++) {
      let user = allUsers[i]

      // An empty list of shoes is the only gear we care about right now
      user.gear = {
        shoes: [],
      }

      try {
        await user.save()
        nModified++
      } catch (err) {
        console.error(err)
      }
    }

    console.log(`${allUsers.length} users found, ${nModified} updated.`)
  } catch (err) {
    console.error(err)
  } finally {
    disconnectFromMongo()
  }
}

addGearToUsers()
