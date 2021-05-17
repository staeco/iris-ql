export default (v) => {
  if (v == null) return [] // nada
  if (Array.isArray(v)) return v.map((s) => String(s))
  if (typeof v === 'string') return v.split(',')
  return [String(v)]
}
