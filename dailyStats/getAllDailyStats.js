import DailyStatsModel from '../db/DailyStatsModel.js'

// Returns the logged in user's runs from the database.
const getAllDailyStats = async (req, res) => {
  const dailyStatsArray = await DailyStatsModel.find({ userId: req.user._id }).lean()

  // Turn it into a map like { dateStr: { key1: val1 } } so lookups by date are faster.
  const dailyStatsMap = {}
  for (let dailyStatsObj of dailyStatsArray) {
    dailyStatsMap[dailyStatsObj.date] = {
      ...dailyStatsObj
    }
  }

  res.json(dailyStatsMap)
  return
}

export default getAllDailyStats
