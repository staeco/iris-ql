export default ({ rawAttributes, _scope }) => {
  if (!_scope) return rawAttributes // no scope
  const { attributes } = _scope
  if (!attributes) return rawAttributes // scope does not apply to attrs
  if (Array.isArray(attributes)) {
    return Object.entries(rawAttributes).reduce((prev, [ k, v ]) => {
      if (!attributes.includes(k)) return prev
      prev[k] = v
      return prev
    }, {})
  }
  throw new Error('Scope too complex - could not determine safe values!')
}
