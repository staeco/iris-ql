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
  if (Array.isArray(attributes.exclude) || Array.isArray(attributes.include)) {
    return Object.entries(rawAttributes).reduce((prev, [ k, v ]) => {
      if (attributes.exclude && attributes.exclude.includes(k)) return prev
      if (attributes.include && !attributes.include.includes(k)) return prev
      prev[k] = v
      return prev
    }, {})
  }
  throw new Error('Scope too complex - could not determine safe values!')
}
