import mongoose from 'mongoose'
import UserModel from '../db/UserModel.js'
import addFloats from '../utils/addFloats.js'

// When a user selects a shoe for their run, update the user's shoe list with the distance and runId
const updateUserShoeList = async (userId, newShoeId, currentShoeId, runId, distance) => {
  // No-op. The shoe should already be in the 
  if (newShoeId === currentShoeId) {
    return
  }

  if (userId == null) {
    console.error('Invalid params for updateUserShoeList: userId must not be null. Returning without updating user shoe list.')
    return
  }

  if (runId == null) {
    console.error('Invalid params for updateUserShoeList: runId must not be null. Returning without updating user shoe list.')
    return
  }

  if (distance == null || typeof distance !== 'number') {
    console.error('Invalid params for updateUserShoeList: distance must be a number. Returning without updating user shoe list.')
    return
  }

  const user = await UserModel.findById(userId).lean()

  if (user == null) {
    console.error(`Could not find user from userId: "${userId}". Returning without updating user shoe list.`)
    return
  }

  if (user.gear == null || user.gear.shoes == null) {
    console.error(`Could not find user from userId: "${userId}". Returning without updating user shoe list.`)
    return 
  }

  // Update the user's shoe list with correct distance and runIds.
  const newShoes = user.gear.shoes.map((shoe) => {
    let newShoe = {
      ...shoe
    }

    const runIdsAsStrings = shoe.runIds.map((shoeRunId) => { return shoeRunId.toString() })

    // Find the shoe the user selected
    if (shoe._id.toString() === newShoeId) {
      // if the shoeId is null, that means the shoe was removed from the run
      if (newShoeId == null) {
        newShoe.distance = addFloats(newShoe.distance, -1 * distance)
        newShoe.runIds = shoe.runIds.filter((id) => {
          return id.toString() !== runId.toString()
        })
      }

      // The shoeId is not null, but if the run is already tied to this shoe, then do not add distance to the shoe
      if (!runIdsAsStrings.includes(runId.toString())) {
        // Otherwise, add the distance to the shoe and add the runId too
        newShoe.distance = addFloats(newShoe.distance, distance)
        newShoe.runIds = [
          ...shoe.runIds,
          runId
        ]
      }
    }

    // This is not the shoe the user selected. But if it was the former shoe, then we should remove
    // mileage from that shoe
    if (shoe._id.toString() === currentShoeId?.toString()) {
      if (runIdsAsStrings.includes(runId.toString())) {
        newShoe.distance = addFloats(newShoe.distance, -1 * distance)
        newShoe.runIds = shoe.runIds.filter((id) => {
          return id.toString() !== runId.toString()
        })
      }
    }

    return newShoe
  })

  await UserModel.updateOne(
    {
      _id: new mongoose.Types.ObjectId(userId)
    },
    {
      gear: {
        ...user.gear,
        shoes: newShoes
      }
    }
  )
}

export default updateUserShoeList
