import pg from 'pg'
import Sequelize from 'sequelize'
import { plural, singular } from 'pluralize'
import { underscore } from 'inflection'
import operators from './operators'

const defaultOptions = {
  logging: false,
  native: false,
  operatorsAliases: operators
}
export default (url, opt={}) => {
  // fix issues with pg types
  pg.types.setTypeParser(20, 'text', pg.types.getTypeParser(23, 'text')) // bigint = int
  pg.types.setTypeParser(1016, 'text', pg.types.getTypeParser(1007, 'text')) // bigint[] = int[]
  pg.types.setTypeParser(1700, 'text', pg.types.getTypeParser(701, 'text')) // numeric = float8
  pg.types.setTypeParser(1231, 'text', pg.types.getTypeParser(1022, 'text')) // numeric[] = float8[]

  // fix bugs with sequelize
  Sequelize.useInflection({
    pluralize: plural,
    singularize: singular,
    underscore
  })
  // See https://github.com/sequelize/sequelize/issues/1500
  Sequelize.Validator.notNull = function (item) {
    return !this.isNull(item)
  }
  const conn = typeof url === 'object'
    ? new Sequelize({
      ...defaultOptions,
      ...url
    })
    : new Sequelize(url, {
      ...defaultOptions,
      ...opt
    })

  // fix sequelize types overriding pg-types
  const override = () => {
    conn.connectionManager.oidParserMap.set(20, pg.types.getTypeParser(20, 'text')) // bigint
    conn.connectionManager.oidParserMap.set(1016, pg.types.getTypeParser(1016, 'text')) // bigint[]
    conn.connectionManager.oidParserMap.set(1700, pg.types.getTypeParser(1700, 'text')) // numeric
    conn.connectionManager.oidParserMap.set(1231, pg.types.getTypeParser(1231, 'text')) // numeric[]
  }
  const oldRefresh = conn.connectionManager.refreshTypeParser.bind(conn.connectionManager)
  conn.connectionManager.refreshTypeParser = (...a) => {
    oldRefresh(...a)
    override()
  }
  override()
  return conn
}
