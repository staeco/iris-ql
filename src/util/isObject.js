export default (x) =>
  typeof x === 'object'
  && x !== null
  && !(x instanceof RegExp)
  && !(x instanceof Error)
  && !(x instanceof Date)
