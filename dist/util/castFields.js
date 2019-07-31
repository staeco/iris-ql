"use strict";

exports.__esModule = true;
exports.default = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _toString = require("./toString");

var _getJSONField = _interopRequireDefault(require("./getJSONField"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (v, opt) => {
  if (Array.isArray(v)) v = {
    $and: v // convert it

  };
  const str = (0, _toString.where)({
    value: v,
    table: opt.table
  });
  const regex = new RegExp(`"${opt.table.name}"\\."(\\w*)"#>>'{(\\w*)}'`, 'g');
  if (!regex.test(str)) return v; // no work needed, keep the same value

  const redone = str.replace(regex, (match, col, field) => {
    const lit = (0, _getJSONField.default)(`${col}.${field}`, opt);
    return (0, _toString.value)({
      value: lit,
      table: opt.table
    });
  });
  return _sequelize.default.literal(redone);
};

exports.default = _default;
module.exports = exports.default;