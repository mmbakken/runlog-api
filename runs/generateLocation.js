import reverse from 'reverse-geocode'

// Given a run start lat/lng, returns a location string describing where this
// run began.
const generateLocation = (lat, lng) => {
  const result = reverse.lookup(lat, lng, 'us')

  return `${result.city}, ${result.state_abbr}`
}

export default generateLocation
