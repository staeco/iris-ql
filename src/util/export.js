import { select } from './toString'
import QueryStream from 'pg-query-stream'
import pump from 'pump'
import through2 from 'through2'

// this wraps a sql query in a stream via a cursor so as each row is found
// it gets transformed and emitted from the stream
// this is how you want to return millions of rows with low memory overhead
const batchSize = 16
const streamable = async ({ model, sql, transform, onError }) => {
  const conn = await model.sequelize.connectionManager.getConnection({
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
    // clean up the connection
    query.destroy(null, (err) => {
      if (onError) onError(err)
      model.sequelize.connectionManager.releaseConnection(conn)
        .then(() => null)
        .catch((err) => {
          if (onError) onError(err)
          return null
        })
    })
    if (err) {
      if (onError) onError(err)
      out.emit('error', err)
    }
  }
  const out = pump(query, modifier, end)
  return out
}


export default async ({ model, value, format, transform, debug, onError, analytics=false }) => {
  const nv = { ...value }

  // prep work findAll usually does
  if (!analytics) {
    // sequelize < 5.10
    if (model._conformOptions) {
      model._injectScope(nv)
      model._conformOptions(nv, model)
      model._expandIncludeAll(nv)
    } else {
      model._injectScope(nv)
      model._conformIncludes(nv, model)
      model._expandAttributes(nv)
      model._expandIncludeAll(nv)
    }
  }

  const sql = select({ value: nv, model })
  if (debug) debug(sql)
  const src = await streamable({ model, sql, transform, onError })
  if (!format) return src
  const out = pump(src, format(), (err) => {
    if (err) out.emit('error', err)
  })
  out.contentType = format.contentType
  return out
}
