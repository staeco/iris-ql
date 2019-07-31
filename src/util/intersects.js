import getGeoFields from './getGeoFields'
import { fn, or, col, literal } from 'sequelize'

export default (geo, { model, column=model.name }) => {
  const geoFields = getGeoFields(model)
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
