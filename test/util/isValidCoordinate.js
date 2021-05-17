import should from 'should'
import { lat, lon } from '../../src/util/isValidCoordinate'

describe('util#isValidCoordinate', () => {
  it('should return type error', () => {
    should(lat('nope')).equal('Latitude not a number, got string')
    should(lon('nope')).equal('Longitude not a number, got string')
  })

  it('should return size error', () => {
    should(lat(91)).equal('Latitude greater than 90')
    should(lat(-91)).equal('Latitude less than -90')
    should(lon(181)).equal('Longitude greater than 180')
    should(lon(-181)).equal('Longitude less than -180')
  })

  it('should return true', () => {
    should(lat(20)).equal(true)
    should(lat(-20)).equal(true)
    should(lon(20)).equal(true)
    should(lon(-20)).equal(true)
  })
})
