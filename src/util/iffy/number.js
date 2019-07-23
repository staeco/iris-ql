export default (v) => {
  if (typeof v === 'number') return v
  if (v == null || !v) return
  if (typeof v === 'string') {
    const n = parseFloat(v)
    if (isNaN(n)) throw new Error('Bad number value')
    return n
  }
  throw new Error('Bad number value')
}
