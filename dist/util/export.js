"use strict";

exports.__esModule = true;
exports.default = void 0;

var _toString = require("./toString");

var _pgQueryStream = _interopRequireDefault(require("pg-query-stream"));

var _readableStream = require("readable-stream");

var _through = _interopRequireDefault(require("through2"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// this wraps a sql query in a stream via a cursor so as each row is found
// it gets transformed and emitted from the stream
// this is how you want to return millions of rows with low memory overhead
const batchSize = 16;

function _ref() {
  return null;
}

const streamable = async ({
  model,
  sql,
  transform,
  tupleFraction,
  onError
}) => {
  const conn = await model.sequelize.connectionManager.getConnection({
    type: 'SELECT'
  });

  if (typeof tupleFraction === 'number') {
    await conn.query(`set cursor_tuple_fraction=${tupleFraction}`);
  } // a not so fun hack to tie our sequelize types into this raw cursor


  let out;
  const query = conn.query(new _pgQueryStream.default(sql, undefined, {
    batchSize,
    types: {
      getTypeParser: conn.getTypeParser.bind(conn)
    }
  }));

  function _ref2(err) {
    if (err && onError) onError(err);
    return null;
  }

  function _ref3(err) {
    if (err && onError) onError(err);
    model.sequelize.connectionManager.releaseConnection(conn).then(_ref).catch(_ref2);
  }

  const end = err => {
    if (err && onError) onError(err);
    if (err) out.emit('error', err); // clean up the connection

    query.destroy(null, _ref3);
  };

  function _ref4(obj, _, cb) {
    return cb(null, transform(obj));
  }

  if (transform) {
    out = (0, _readableStream.pipeline)(query, _through.default.obj(_ref4), end);
  } else {
    out = query;
    (0, _readableStream.finished)(query, end);
  }

  return out;
};

var _default = async ({
  model,
  value,
  format,
  transform,
  tupleFraction,
  debug,
  onError,
  analytics = false
}) => {
  const nv = { ...value
  }; // prep work findAll usually does

  if (!analytics) {
    // sequelize < 5.10
    if (model._conformOptions) {
      model._injectScope(nv);

      model._conformOptions(nv, model);

      model._expandIncludeAll(nv);
    } else {
      model._injectScope(nv);

      model._conformIncludes(nv, model);

      model._expandAttributes(nv);

      model._expandIncludeAll(nv);
    }
  }

  const sql = (0, _toString.select)({
    value: nv,
    model
  });
  if (debug) debug(sql);
  const src = await streamable({
    model,
    tupleFraction,
    sql,
    transform,
    onError
  });
  if (!format) return src;
  const out = (0, _readableStream.pipeline)(src, format(), err => {
    if (err) out.emit('error', err);
  });
  out.contentType = format.contentType;
  return out;
};

exports.default = _default;
module.exports = exports.default;