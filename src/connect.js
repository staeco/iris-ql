import Sequelize from 'sequelize'
import pg from 'pg'
import { plural, singular } from 'pluralize'
import { underscore } from 'inflection'
import operators from './operators'

// fix bugs with sequelize or node-pg
pg.defaults.parseInt8 = true // does bigint
Sequelize.useInflection({
  pluralize: plural,
  singularize: singular,
  underscore
})
// See https://github.com/sequelize/sequelize/issues/1500
Sequelize.Validator.notNull = function (item) {
  return !this.isNull(item)
}

const defaultOptions = {
  logging: false,
  native: false,
  operatorsAliases: operators
}
export default (url, opt={}) => {
  if (typeof url === 'object') {
    return new Sequelize({
      ...defaultOptions,
      ...url
    })
  }
  return new Sequelize(url, {
    ...defaultOptions,
    ...opt
  })
}
