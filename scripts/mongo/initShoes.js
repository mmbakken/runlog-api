import mongoose from 'mongoose'
import connectToMongo from '../../db/connectToMongo.js'
import disconnectFromMongo from '../../db/disconnectFromMongo.js'
import UserModel from '../../db/UserModel.js'
import ShoeModel from '../../db/ShoeModel.js'
import RunModel from '../../db/RunModel.js'

// Moves every `user.gear.shoes` sub-document into the shoes collection as its
// own docuemnt. The `user.gear.shoes[i].id` field is not preserved.
const initShoes = async () => {
  await connectToMongo()

  // Find each user document.
  // For each of the shoe sub-documents in the user.gear.shoes array:
  // - Create a new Shoe document with the same fields as before
  // - Also add the `userId` field to relate it back to its User doc.

  // After this script has run and you verify the shoe data was copied:
  // - Make a new script for deleting user gear
  // - Delete the user gear and save the user docs
  // - Delete `gear` from the UserModel
  try {
    const allUsers = await UserModel.find(
      {}, // all users
      '_id gear'
    )

    let usersModified = 0
    let newShoeCount = 0

    // Key: old shoe id (from user.gear.shoes objects), string
    // Value: new shoe id (ShoeModel), string
    let shoeIdMap = {}
    for (const user of allUsers) {
      console.log('User:')
      console.log(user.inspect())

      for (const shoe of user.gear.shoes) {
        const newShoe = new ShoeModel({
          userId: user._id,
          title: shoe.title,
          runIds: shoe.runIds,
          distance: shoe.distance,
        })

        console.log('New shoe:')
        console.log(newShoe.inspect())

        const newShoeDoc = await newShoe.save()
        shoeIdMap[shoe._id.toString()] = newShoeDoc._id.toString()

        newShoeCount++
      }

      console.log('~~~~~~~~~~~~~~~~`')
    }

    console.log(
      `${allUsers.length} users found, ${usersModified} updated (should be 0 updated).`
    )
    console.log(`${newShoeCount} shoes created.`)
    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~`)

    console.log(`Updating run.shoeId to match new ShoeModel documents.`)
    console.log('Old user.shoe.id => new shoe id:')
    console.dir(shoeIdMap)

    let runsModified = 0

    const allRuns = await RunModel.find(
      {}, // all runs
      '_id shoeId'
    )

    // Update each run with new shoeId value
    for (const run of allRuns) {
      console.log('Updating run:')
      console.dir(run.inspect())

      if (run.shoeId == null) {
        console.log(
          `There is no shoeId for this run. Skipping setting the shoeId.`
        )
        continue
      }

      const newShoeIdStr = shoeIdMap[run.shoeId.toString()]
      run.shoeId = new mongoose.Types.ObjectId(newShoeIdStr)

      console.log(`DRY RUN: Setting new run.shoeId to: ${newShoeIdStr}`)
      // await run.save()
      // runsModified++
    }

    console.log(`${allRuns.length} runs found, ${runsModified} updated.`)
    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~`)

    console.log(`Removing user.gear.shoes from all User docs`)

    let usersModified2 = 0

    // Finally, delete all of the old shoe records (only use of `user.gear`).
    for (const user of allUsers) {
      console.log('User:')
      console.log(user.inspect())

      console.log(`DRY RUN: Deleting user.gear: ${user.gear}`)
      // delete user.gear
      // await user.save()
      // usersModified2++

      console.log(`${allUsers.length} users found, ${usersModified2} updated.`)
      console.log('~~~~~~~~~~~~~~~~`')
    }
  } catch (err) {
    console.error(err)
  } finally {
    await disconnectFromMongo()
  }
}

initShoes()
