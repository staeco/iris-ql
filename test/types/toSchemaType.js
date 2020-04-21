import should from 'should'
import sql from 'sequelize'
import fn from '../../src/types/toSchemaType'

describe('types#toSchemaType', () => {
  it('should work on text types', () => {
    const expected = { type: 'text' }
    should(fn(sql.STRING)).eql(expected)
    should(fn(sql.STRING(100))).eql(expected)
    should(fn(sql.STRING.BINARY)).eql(expected)
    should(fn(sql.TEXT)).eql(expected)
    should(fn(sql.TEXT('tiny'))).eql(expected)
    should(fn(sql.UUID)).eql(expected)
    should(fn(sql.CITEXT)).eql(expected)
    should(fn(sql.CHAR)).eql(expected)
  })
  it('should work on date types', () => {
    const expected = { type: 'date' }
    should(fn(sql.DATE)).eql(expected)
    should(fn(sql.DATE(6))).eql(expected)
    should(fn(sql.DATEONLY)).eql(expected)
  })
  it('should work on boolean types', () => {
    const expected = { type: 'boolean' }
    should(fn(sql.BOOLEAN)).eql(expected)
  })
  it('should work on number types', () => {
    const expected = { type: 'number' }
    should(fn(sql.INTEGER)).eql(expected)
    should(fn(sql.TINYINT)).eql(expected)
    should(fn(sql.SMALLINT)).eql(expected)
    should(fn(sql.BIGINT)).eql(expected)
    should(fn(sql.BIGINT(11))).eql(expected)
    should(fn(sql.FLOAT)).eql(expected)
    should(fn(sql.FLOAT(11))).eql(expected)
    should(fn(sql.FLOAT(11, 10))).eql(expected)
    should(fn(sql.REAL)).eql(expected)
    should(fn(sql.REAL(11))).eql(expected)
    should(fn(sql.REAL(11, 10))).eql(expected)
    should(fn(sql.DOUBLE)).eql(expected)
    should(fn(sql.DOUBLE(11))).eql(expected)
    should(fn(sql.DOUBLE(11, 10))).eql(expected)
    should(fn(sql.DECIMAL)).eql(expected)
    should(fn(sql.DECIMAL(11, 10))).eql(expected)
  })
  it('should work on json types', () => {
    const expected = { type: 'object', schema: undefined }
    should(fn(sql.JSON)).eql(expected)
    should(fn(sql.JSONB)).eql(expected)
  })
  it('should work on array types', () => {
    should(fn(sql.ARRAY(sql.STRING))).eql({
      type: 'array',
      items: {
        type: 'text'
      }
    })
    should(fn(sql.ARRAY(sql.FLOAT))).eql({
      type: 'array',
      items: {
        type: 'number'
      }
    })
  })
  it('should work on geometry types', () => {
    should(fn(sql.GEOMETRY)).eql({ type: 'geometry' })
    should(fn(sql.GEOMETRY('POINT'))).eql({ type: 'point' })
    should(fn(sql.GEOMETRY('LINESTRING'))).eql({ type: 'line' })
    should(fn(sql.GEOMETRY('MULTILINESTRING'))).eql({ type: 'multiline' })
    should(fn(sql.GEOMETRY('POLYGON'))).eql({ type: 'polygon' })
    should(fn(sql.GEOMETRY('MULTIPOLYGON'))).eql({ type: 'multipolygon' })
    should(fn(sql.GEOGRAPHY)).eql({ type: 'geometry' })
    should(fn(sql.GEOGRAPHY('POINT'))).eql({ type: 'point' })
    should(fn(sql.GEOGRAPHY('LINESTRING'))).eql({ type: 'line' })
    should(fn(sql.GEOGRAPHY('MULTILINESTRING'))).eql({ type: 'multiline' })
    should(fn(sql.GEOGRAPHY('POLYGON'))).eql({ type: 'polygon' })
    should(fn(sql.GEOGRAPHY('MULTIPOLYGON'))).eql({ type: 'multipolygon' })
  })
})
