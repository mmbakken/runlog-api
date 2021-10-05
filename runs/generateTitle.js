import { DateTime } from 'luxon'

// Given a run start time & tz, returns a title string describing this run.
const generateTitle = (runStartTime, timezone) => {
  const dt = DateTime.fromJSDate(runStartTime, { zone: timezone })

  // Thresholds
  const startOfMorning = dt.set({ hour: 4, minute: 0, second: 0 })
  const startOfAfternoon = dt.set({ hour: 12, minute: 0, second: 0 })
  const startOfEvening = dt.set({ hour: 17, minute: 0, second: 0 })
  const startOfLateNight = dt.set({ hour: 22, minute: 0, second: 0 })

  if (dt < startOfMorning || dt >= startOfLateNight) {
    return 'Late Night Run'
  } else if (dt < startOfAfternoon) {
    return 'Morning Run'
  } else if (dt < startOfEvening) {
    return 'Afternoon Run'
  } else {
    return 'Evening Run'
  }
}

export default generateTitle
