import connectToMongo from '../../db/connectToMongo.js'
import disconnectFromMongo from '../../db/disconnectFromMongo.js'
import TrainingModel from '../../db/TrainingModel.js'

import updatePlanActualDistances from '../../training/updatePlanActualDistances.js'

// Recalculate existing plan actualDistance fields
const updateTrainingPlanActualDistances = async () => {
  await connectToMongo()

  try {

    // Get all plans
    // For each plan, update its actualDistance fields
    // Save the plam
    const allPlans = await TrainingModel.find({}).exec()

    for (let plan of allPlans) {
      plan = await updatePlanActualDistances(plan)

      console.log('Updating plan:')
      console.dir(plan._doc)

      await plan.save()
    }

    return 1
  } catch (error) {
    console.error(error)
    return -1
  } finally {
    disconnectFromMongo()
  }
}

updateTrainingPlanActualDistances()
