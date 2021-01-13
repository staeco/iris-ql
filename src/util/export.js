import { select } from './toString'
import QueryStream from 'pg-query-stream'
import { pipeline, finished } from 'readable-stream'
import through2 from 'through2'

// this wraps a sql query in a stream via a cursor so as each row is found
// it gets transformed and emitted from the stream
// this is how you want to return millions of rows with low memory overhead
const batchSize = 16
const streamable = async ({ useMaster, model, sql, transform, tupleFraction, onError }) => {
  const conn = await model.sequelize.connectionManager.getConnection({
    useMaster,
    type: 'SELECT'
  })
  if (typeof tupleFraction === 'number') {
    await conn.query(`set cursor_tuple_fraction=${tupleFraction}`)
  }

  // a not so fun hack to tie our sequelize types into this raw cursor
  let out
  const query = conn.query(new QueryStream(sql, undefined, {
    batchSize,
    types: {
      getTypeParser: conn.getTypeParser.bind(conn)
    }
  }))

  const end = (err) => {
    if (err && onError) onError(err)
    if (err) out.emit('error', err)

    // clean up the connection
    query.destroy(null, (err) => {
      if (err && onError) onError(err)
      model.sequelize.connectionManager.releaseConnection(conn)
        .then(() => null)
        .catch((err) => {
          if (err && onError) onError(err)
          return null
        })
    })
  }
  if (transform) {
    out = pipeline(
      query,
      through2.obj((obj, _, cb) => cb(null, transform(obj))),
      end
    )
  } else {
    out = query
    finished(query, end)
  }
  return out
}


export default async ({ useMaster, model, value, format, transform, tupleFraction, debug, onError, analytics = false }) => {
  const nv = { ...value }
  const sql = select({ value: nv, model, analytics })
  if (debug) debug(sql)
  const src = await streamable({ useMaster, model, tupleFraction, sql, transform, onError })
  if (!format) return src
  const out = pipeline(src, format(), (err) => {
    if (err) out.emit('error', err)
  })
  out.contentType = format.contentType
  return out
}
