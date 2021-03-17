import sql from 'sequelize'

export default (model) => {
  const attrs = model.rawAttributes
  const ret = Object.keys(attrs).filter((k) => {
    const { type } = attrs[k]
    return type instanceof sql.GEOGRAPHY || type instanceof sql.GEOMETRY
  })

  return ret.length > 0 ? ret : null
}
