// For two Numbers, add them together and return the value as a Number with at most two decimal places.
const addFloats = (a, b) => {
  if (
    a == null ||
    Number.isNaN(a) ||
    typeof a !== 'number' ||
    b == null ||
    Number.isNaN(b) ||
    typeof b !== 'number'
  ) {
    return NaN
  }

  return Math.round((a + b + Number.EPSILON) * 100) / 100
}

export default addFloats
