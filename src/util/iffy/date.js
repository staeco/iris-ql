export default (v) => {
  if (v == null || !v) return
  const d = new Date(v)
  if (isNaN(d)) throw new Error('Bad date value')
  return d
}
