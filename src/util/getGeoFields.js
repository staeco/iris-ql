// TODO: convert to use plain sequelize info, not custom table info
export default (tableSchema) => {
  const ret = Object.keys(tableSchema).filter((k) =>
    tableSchema[k].geospatial
  )

  return ret.length !== 0 ? ret : null
}
