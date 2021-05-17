import eachDeep from 'deepdash/eachDeep'

export default (v, fn) => {
  const res = []
  eachDeep(
    v,
    (value, key, path) => {
      if (fn(key, value)) res.push({ path, value })
    },
    { pathFormat: 'array' }
  )
  return res.length === 0 ? undefined : res
}
