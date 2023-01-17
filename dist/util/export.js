"use strict";

exports.__esModule = true;
exports.default = void 0;
var _pgQueryStream = _interopRequireDefault(require("pg-query-stream"));
var _stream = require("stream");
var _toString = require("./toString");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// this wraps a sql query in a stream via a cursor so as each row is found
// it gets transformed and emitted from the stream
// this is how you want to return millions of rows with low memory overhead
const batchSize = 16;
const streamable = async ({
  useMaster,
  model,
  sql,
  transform,
  timeout,
  finishTimeout,
  debug,
  tupleFraction,
  onError
}) => {
  const conn = await model.sequelize.connectionManager.getConnection({
    useMaster,
    type: 'SELECT'
  });
  const warm = [];
  if (timeout) warm.push(`SET idle_in_transaction_session_timeout = ${parseInt(timeout)};`);
  if (finishTimeout) warm.push(`SET statement_timeout = ${parseInt(finishTimeout)};`);
  if (typeof tupleFraction === 'number') warm.push(`SET cursor_tuple_fraction=${tupleFraction};`);
  if (warm.length > 0) {
    await conn.query(warm.join('\n'));
  }
  // a not so fun hack to tie our sequelize types into this raw cursor
  let out;
  if (debug) debug(sql);
  const query = conn.query(new _pgQueryStream.default(sql, undefined, {
    batchSize,
    types: {
      getTypeParser: conn.getTypeParser.bind(conn)
    }
  }));
  function _ref(err) {
    if (err && onError) onError(err);
    model.sequelize.connectionManager.releaseConnection(conn);
  }
  const end = err => {
    if (err && onError) onError(err);
    if (err) out.emit('error', err);

    // clean up the connection
    query.destroy(null, _ref);
  };
  if (transform) {
    out = (0, _stream.pipeline)(query, new _stream.Transform({
      objectMode: true,
      transform(obj, _, cb) {
        cb(null, transform(obj));
      }
    }), end);
  } else {
    out = query;
    (0, _stream.finished)(query, end);
  }
  return out;
};
var _default = async ({
  useMaster,
  model,
  value,
  format,
  transform,
  tupleFraction,
  debug,
  timeout,
  finishTimeout,
  onError,
  analytics = false
}) => {
  const nv = {
    ...value
  };
  const sql = (0, _toString.select)({
    value: nv,
    model,
    analytics
  });
  const src = await streamable({
    useMaster,
    model,
    tupleFraction,
    timeout,
    finishTimeout,
    debug,
    sql,
    transform,
    onError
  });
  if (!format) return src;
  const out = (0, _stream.pipeline)(src, format(), err => {
    if (err) out.emit('error', err);
  });
  out.contentType = format.contentType;
  return out;
};
exports.default = _default;
module.exports = exports.default;