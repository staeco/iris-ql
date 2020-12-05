"use strict";

exports.__esModule = true;
exports.default = void 0;

var _pg = _interopRequireDefault(require("pg"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _pluralize = require("pluralize");

var _inflection = require("inflection");

var _operators = _interopRequireDefault(require("./operators"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-magic-numbers */
const alignTypeParser = (conn, id) => {
  const parser = _pg.default.types.getTypeParser(id, 'text'); // sequelize 5+


  if (conn.connectionManager.oidParserMap) {
    conn.connectionManager.oidParserMap.set(id, parser);
    return conn;
  } // sequelize 4


  conn.connectionManager.oidMap[id] = parser;
  return conn;
};

const defaultOptions = {
  logging: false,
  native: false,
  operatorsAliases: _operators.default
};

function _ref(item) {
  return !this.isNull(item);
}

var _default = (url, opt = {}) => {
  // fix issues with pg types
  _pg.default.types.setTypeParser(20, 'text', _pg.default.types.getTypeParser(23, 'text')); // bigint = int


  _pg.default.types.setTypeParser(1016, 'text', _pg.default.types.getTypeParser(1007, 'text')); // bigint[] = int[]


  _pg.default.types.setTypeParser(1700, 'text', _pg.default.types.getTypeParser(701, 'text')); // numeric = float8


  _pg.default.types.setTypeParser(1231, 'text', _pg.default.types.getTypeParser(1022, 'text')); // numeric[] = float8[]
  // fix bugs with sequelize


  _sequelize.default.useInflection({
    pluralize: _pluralize.plural,
    singularize: _pluralize.singular,
    underscore: _inflection.underscore
  }); // See https://github.com/sequelize/sequelize/issues/1500


  _sequelize.default.Validator.notNull = _ref;
  const conn = typeof url === 'object' ? new _sequelize.default({ ...defaultOptions,
    ...url
  }) : new _sequelize.default(url, { ...defaultOptions,
    ...opt
  }); // fix sequelize types overriding pg-types

  const override = () => {
    alignTypeParser(conn, 20); // bigint

    alignTypeParser(conn, 1016); // bigint[]

    alignTypeParser(conn, 1700); // numeric

    alignTypeParser(conn, 1231); // numeric[]
  };

  const oldRefresh = conn.connectionManager.refreshTypeParser.bind(conn.connectionManager);

  conn.connectionManager.refreshTypeParser = (...a) => {
    oldRefresh(...a);
    override();
  };

  override();
  return conn;
};

exports.default = _default;
module.exports = exports.default;