import types from 'sequelize'

export default (table) => {
  const attrs = table.rawAttributes
  const ret = Object.keys(attrs).filter((k) => {
    const { type } = attrs[k]
    return type instanceof types.GEOGRAPHY || type instanceof types.GEOMETRY
  })

  return ret.length !== 0 ? ret : null
}
