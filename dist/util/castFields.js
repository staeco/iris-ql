"use strict";

exports.__esModule = true;
exports.default = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _toString = require("./toString");

var _getJSONField = _interopRequireDefault(require("./getJSONField"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const jsonField = /"(\w*)"\."(\w*)"#>>'{(\w*)}'/g; // sometimes sequelize randomly wraps json access in useless parens, so unwrap everything

const wrapped = /\("(\w*)"\."(\w*)"#>>'{(\w*)}'\)/g;

function _ref(match, table, col, field) {
  return `"${table}"."${col}"#>>'{${field}}'`;
}

const unwrap = str => str.replace(wrapped, _ref);

var _default = (v, opt) => {
  if (Array.isArray(v)) v = {
    $and: v // convert it

  };
  const str = (0, _toString.where)({
    value: v,
    model: opt.model
  });
  if (!jsonField.test(str)) return v; // nothing to do! no fields to cast
  // if the field is followed by " IS" then skip, because we dont need to cast that
  // since its either IS NULL or IS NOT NULL

  const needsCasting = new RegExp(`"${opt.model.name}"\\."(\\w*)"#>>'{(\\w*)}'(?! IS)`, 'g');
  const redone = unwrap(str).replace(needsCasting, (match, col, field) => {
    const lit = (0, _getJSONField.default)(`${col}.${field}`, opt);
    return (0, _toString.value)({
      value: lit,
      model: opt.model
    });
  });
  return _sequelize.default.literal(redone);
};

exports.default = _default;
module.exports = exports.default;