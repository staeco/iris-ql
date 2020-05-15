"use strict";

exports.__esModule = true;
exports.default = void 0;

var _toString = require("./toString");

var _pgQueryStream = _interopRequireDefault(require("pg-query-stream"));

var _pump = _interopRequireDefault(require("pump"));

var _through = _interopRequireDefault(require("through2"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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


  const query = conn.query(new _pgQueryStream.default(sql, undefined, {
    batchSize,
    types: {
      getTypeParser: conn.getTypeParser.bind(conn)
    }
  }));
  const modifier = transform ? _through.default.obj((obj, _, cb) => cb(null, transform(obj))) : _through.default.obj();

  function _ref2(err) {
    if (err && onError) onError(err);
    return null;
  }

  function _ref3(err) {
    if (err && onError) onError(err);
    model.sequelize.connectionManager.releaseConnection(conn).then(_ref).catch(_ref2);
  }

  const end = err => {
    // clean up the connection
    query.destroy(null, _ref3);
    if (err && onError) onError(err);
    if (err) out.emit('error', err);
  };

  const out = (0, _pump.default)(query, modifier, end);
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
  const nv = _objectSpread({}, value); // prep work findAll usually does


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
  const out = (0, _pump.default)(src, format(), err => {
    if (err) out.emit('error', err);
  });
  out.contentType = format.contentType;
  return out;
};

exports.default = _default;
module.exports = exports.default;