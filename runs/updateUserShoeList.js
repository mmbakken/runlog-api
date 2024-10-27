import mongoose from 'mongoose'
import ShoeModel from '../db/ShoeModel.js'
import addFloats from '../utils/addFloats.js'

// Given a shoeId and an optional currentShoeId, this function updates the shoes
// matching each id to reflect that a run has been assigned a new shoe.
// TODO: Do we need the userId?
const updateUserShoeList = async (
  shoeId,
  currentShoeId,
  userId,
  runId,
  distance
) => {
  // NB: There is no way to "unset" a shoe for a run, once a shoe is set.
  if (shoeId == null) {
    throw new Error(
      'Invalid params for updateUserShoeList: shoeId must not be null. Returning without updating user shoe list.'
    )
  }

  if (runId == null) {
    throw new Error(
      'Invalid params for updateUserShoeList: runId must not be null. Returning without updating user shoe list.'
    )
  }

  if (distance == null || typeof distance !== 'number') {
    throw new Error(
      'Invalid params for updateUserShoeList: distance must be a number. Returning without updating user shoe list.'
    )
  }

  // Add the runId and distance to the new shoe
  let newShoe
  try {
    // Find the new shoes assigned to this run.
    newShoe = await ShoeModel.findById(shoeId).lean()

    if (newShoe == null) {
      throw new Error(
        `Unable to find shoe document with id: "${shoeId}". Returning without updating shoe run ids or distance.`
      )
    }
  } catch (err) {
    console.error(err)
    throw new Error(
      `Something went wrong while trying to find the new shoe with id "${shoeId}". Returning without updating shoe run ids or distance.`
    )
  }

  try {
    await ShoeModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(shoeId),
      },
      {
        runIds: [...newShoe.runIds, runId],
        distance: addFloats(newShoe.distance, distance),
      }
    )
  } catch (err) {
    console.error(err)
    throw new Error(
      `Something went wrong while updating the new shoe with id "${shoeId}". Returning without updating shoe run ids or distance.`
    )
  }

  // Update the current run's shoe to no longer include the runId or distance
  // from the run.
  /// NB: The currentShoe might not have been assigned yet.
  if (currentShoeId != null) {
    const currentShoe = await ShoeModel.findById(currentShoeId).lean()

    if (currentShoe != null) {
      // Remove the runId from the current run's shoe
      const updatedRunIds = currentShoe.runIds.filter(id => {
        return id.toString() !== runId.toString()
      })

      // Remove the distance of that run from the current run's shoe
      const updatedDistance = addFloats(currentShoe.distance, -1 * distance)

      try {
        await ShoeModel.updateOne(
          {
            _id: new mongoose.Types.ObjectId(currentShoeId),
          },
          {
            runIds: updatedRunIds,
            distance: updatedDistance,
          }
        )
      } catch (err) {
        console.error(err)
        throw new Error(
          `Something went wrong while updating the current shoe with id "${currentShoeId}". Returning without updating shoe run ids or distance.`
        )
      }
    }
  }
}

export default updateUserShoeList
