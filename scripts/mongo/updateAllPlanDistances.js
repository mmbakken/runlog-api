import connectToMongo from '../../db/connectToMongo.js'
import disconnectFromMongo from '../../db/disconnectFromMongo.js'
import TrainingModel from '../../db/TrainingModel.js'
import updatePlanDistances from '../../training/updatePlanDistances.js'

// Sets the plannedDistance values for
const updateAllPlanDistances = async () => {
  connectToMongo()

  // For each user, find all of their plans. Then run the function that recalculates the planned
  // distance fields based on the existing date.plannedDistance field.

  let allPlans
  try {
    allPlans = await TrainingModel.find({})
  } catch (err) {
    console.error(err)
  }

  for (let i = 0; i < allPlans.length; i++) {
    try {
      let plan = allPlans[i]
      plan = await updatePlanDistances(allPlans[i])
      await plan.save()
    } catch (err) {
      console.error(err)
    }
  }

  disconnectFromMongo()
}

updateAllPlanDistances()
