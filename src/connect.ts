/* eslint-disable no-magic-numbers */
import pg from 'pg'
import Root, { Sequelize } from 'sequelize'
import { plural, singular } from 'pluralize'
import { underscore } from 'inflection'
import operators from './operators'

const alignTypeParser = (conn, id) => {
  const parser = pg.types.getTypeParser(id, 'text')
  // sequelize 5+
  if (conn.connectionManager.oidParserMap) {
    conn.connectionManager.oidParserMap.set(id, parser)
    return conn
  }
  // sequelize 4
  conn.connectionManager.oidMap[id] = parser
  return conn
}

const defaultOptions = {
  logging: false,
  native: false,
  operatorsAliases: operators,
  timezone: 'UTC'
}
type AnyClass = {
  new (url, options?): any
}
export default (url, opt = {}, Instance: AnyClass = Sequelize) => {
  // fix issues with pg types
  pg.types.setTypeParser(20, 'text', pg.types.getTypeParser(23, 'text')) // bigint = int
  pg.types.setTypeParser(1016, 'text', pg.types.getTypeParser(1007, 'text')) // bigint[] = int[]
  pg.types.setTypeParser(1700, 'text', pg.types.getTypeParser(701, 'text')) // numeric = float8
  pg.types.setTypeParser(1231, 'text', pg.types.getTypeParser(1022, 'text')) // numeric[] = float8[]

  // fix bugs with sequelize
  Root.useInflection({
    pluralize: plural,
    singularize: singular,
    // @ts-ignore
    underscore
  })
  // See https://github.com/sequelize/sequelize/issues/1500
  // @ts-ignore
  Root.Validator.notNull = function (item) {
    return !this.isNull(item)
  }
  // you can override Instance if you use sequelize-typescript
  const conn =
    typeof url === 'object'
      ? new Instance({
          ...defaultOptions,
          ...url
        })
      : new Instance(url, {
          ...defaultOptions,
          ...opt
        })

  // fix sequelize types overriding pg-types
  const override = () => {
    alignTypeParser(conn, 20) // bigint
    alignTypeParser(conn, 1016) // bigint[]
    alignTypeParser(conn, 1700) // numeric
    alignTypeParser(conn, 1231) // numeric[]
  }
  const oldRefresh = conn.connectionManager.refreshTypeParser.bind(
    conn.connectionManager
  )
  conn.connectionManager.refreshTypeParser = (...a) => {
    oldRefresh(...a)
    override()
  }
  override()
  return conn
}
