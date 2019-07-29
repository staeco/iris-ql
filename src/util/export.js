import { select } from './toString'
import QueryStream from 'pg-query-stream'
import pump from 'pump'
import through2 from 'through2'

// this wraps a sql query in a stream via a cursor so as each row is found
// it gets transformed and emitted from the stream
// this is how you want to return millions of rows with low memory overhead
const batchSize = 16
const streamable = async (table, sql, transform) => {
  const conn = await table.sequelize.connectionManager.getConnection({
    type: 'SELECT'
  })
  // a not so fun hack to tie our sequelize types into this raw cursor
  const query = conn.query(new QueryStream(sql, undefined, {
    batchSize,
    types: {
      getTypeParser: conn.getTypeParser.bind(conn)
    }
  }))

  const modifier = transform ? through2.obj((obj, _, cb) =>
    cb(null, transform(obj))
  ) : through2.obj()

  const end = (err) => {
    query.close(() => {
      table.sequelize.connectionManager.releaseConnection(conn)
        .then(() => null)
        .catch(() => null)
    })
    if (err) out.emit('error', err)
  }
  const out = pump(query, modifier, end)
  return out
}


export default async ({ table, value, format, transform, analytics=false }) => {
  const nv = { ...value }

  // prep work findAll usually does
  if (!analytics) {
    // sequelize < 5.10
    if (table._conformOptions) {
      table._injectScope(nv)
      table._conformOptions(nv, table)
      table._expandIncludeAll(nv)
    } else {
      table._injectScope(nv)
      table._conformIncludes(nv, table)
      table._expandAttributes(nv)
      table._expandIncludeAll(nv)
    }
  }

  const sql = select({ value: nv, table })
  const src = await streamable(table, sql, transform)
  if (!format) return src
  const out = pump(src, format())
  out.contentType = format.contentType
  return out
}
