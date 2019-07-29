"use strict";

exports.__esModule = true;
exports.default = void 0;

var _toString = require("./toString");

var _pgQueryStream = _interopRequireDefault(require("pg-query-stream"));

var _pump = _interopRequireDefault(require("pump"));

var _through = _interopRequireDefault(require("through2"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// this wraps a sql query in a stream via a cursor so as each row is found
// it gets transformed and emitted from the stream
// this is how you want to return millions of rows with low memory overhead
const batchSize = 16;

function _ref() {
  return null;
}

function _ref2() {
  return null;
}

const streamable = async (table, sql, transform) => {
  const conn = await table.sequelize.connectionManager.getConnection({
    type: 'SELECT'
  }); // a not so fun hack to tie our sequelize types into this raw cursor

  const query = conn.query(new _pgQueryStream.default(sql, undefined, {
    batchSize,
    types: {
      getTypeParser: conn.getTypeParser.bind(conn)
    }
  }));
  const modifier = transform ? _through.default.obj((obj, _, cb) => cb(null, transform(obj))) : _through.default.obj();

  function _ref3() {
    table.sequelize.connectionManager.releaseConnection(conn).then(_ref).catch(_ref2);
  }

  const end = err => {
    query.close(_ref3);
    if (err) out.emit('error', err);
  };

  const out = (0, _pump.default)(query, modifier, end);
  return out;
};

var _default = async ({
  table,
  value,
  format,
  transform,
  analytics = false
}) => {
  const nv = _objectSpread({}, value); // prep work findAll usually does


  if (!analytics) {
    table._injectScope(nv);

    table._conformIncludes(nv, table);

    table._expandAttributes(nv);

    table._expandIncludeAll(nv);
  }

  const sql = (0, _toString.select)({
    value: nv,
    table
  });
  const src = await streamable(table, sql, transform);
  if (!format) return src;
  const out = (0, _pump.default)(src, format());
  out.contentType = format.contentType;
  return out;
};

exports.default = _default;
module.exports = exports.default;