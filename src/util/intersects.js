import getGeoFields from './getGeoFields'
import { fn, or, col, literal } from 'sequelize'

// TODO: convert to use plain sequelize info, not custom table
export default (geo, { table, column=table.resource }) => {
  const geoFields = getGeoFields(table.fields.schema)
  if (!geo || !geoFields) return literal(false)
  const wheres = geoFields.map((f) =>
    fn(
      'ST_Intersects',
      col(`${column}.${f}`),
      geo
    )
  )
  if (wheres.length === 1) return wheres[0]
  return or(...wheres)
}
