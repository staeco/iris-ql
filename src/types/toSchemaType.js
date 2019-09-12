// converts sequelize types to subSchema types
const geomTypes = {
  point: 'point',
  linestring: 'line',
  multilinestring: 'multiline',
  polygon: 'polygon',
  multipolygon: 'multipolygon'
}
const toSchemaType = (type) => {
  const key = type.key || type.constructor.key
  if (key === 'STRING') return { type: 'text' }
  if (key === 'TEXT') return { type: 'text' }
  if (key === 'UUID') return { type: 'text' }
  if (key === 'CITEXT') return { type: 'text' }
  if (key === 'CHAR') return { type: 'text' }
  if (key === 'DATE') return { type: 'date' }
  if (key === 'DATEONLY') return { type: 'date' }
  if (key === 'BOOLEAN') return { type: 'boolean' }
  if (key === 'INTEGER') return { type: 'number' }
  if (key === 'TINYINT') return { type: 'number' }
  if (key === 'SMALLINT') return { type: 'number' }
  if (key === 'BIGINT') return { type: 'number' }
  if (key === 'FLOAT') return { type: 'number' }
  if (key === 'REAL') return { type: 'number' }
  if (key === 'DOUBLE PRECISION') return { type: 'number' }
  if (key === 'DECIMAL') return { type: 'number' }
  if (key === 'JSON') return { type: 'object' }
  if (key === 'JSONB') return { type: 'object' }
  if (key === 'ARRAY') return { type: 'array', items: toSchemaType(type.type) }
  if (key === 'GEOMETRY' || key === 'GEOGRAPHY') {
    const subtype = type.type?.toLowerCase()
    if (geomTypes[subtype]) return { type: geomTypes[subtype] }
    return { type: 'geometry' }
  }

  // Unsupported types: ENUM, BLOB, CIDR, INET, MACADDR, RANGE, HSTORE
  return null
}

export default toSchemaType
