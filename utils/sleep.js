// Implements a sleep function in JS. Wait param is in ms.
const sleep = (wait) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, wait)
  })
}

export default sleep
