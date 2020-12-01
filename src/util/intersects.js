import getGeoFields from './getGeoFields'
import { fn, or, cast, col, literal } from 'sequelize'

export default (geo, { model, column = model.name }) => {
  const geoFields = getGeoFields(model)
  if (!geo || !geoFields) return literal(false)
  const wheres = geoFields.map((f) =>
    fn('ST_Intersects', cast(col(`${column}.${f}`), 'geometry'), cast(geo, 'geometry'))
  )
  if (wheres.length === 1) return wheres[0]
  return or(...wheres)
}
