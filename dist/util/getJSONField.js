"use strict";

exports.__esModule = true;
exports.default = void 0;

var _sequelize = require("sequelize");

var _toString = require("./toString");

var dataTypeTypes = _interopRequireWildcard(require("../types"));

var _errors = require("../errors");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// TODO: convert to use plain sequelize info, not custom table
var _default = (v, opt) => {
  const {
    context = [],
    dataType,
    table,
    fieldLimit = Object.keys(table.rawAttributes),
    cast = true
  } = opt;
  const path = v.split('.');
  const col = path.shift();

  if (fieldLimit && !fieldLimit.includes(col)) {
    throw new _errors.ValidationError({
      path: context,
      value: v,
      message: `Field does not exist: ${col}`
    });
  }

  const lit = (0, _sequelize.literal)((0, _toString.jsonPath)({
    column: col,
    table,
    path
  }));
  if (!dataType || !cast) return lit; // non-dataType json fields, or asked to keep it raw
  // if a dataType is specified, check the type of the field to see if it needs casting
  // this is because pg treats all json values as text, so we need to explicitly cast types for things
  // to work the way we expect

  const field = path[0];
  const attrDef = dataType.schema[field];

  if (!attrDef) {
    throw new _errors.ValidationError({
      path: context,
      value: v,
      message: `Field does not exist: ${col}.${field}`
    });
  }

  return dataTypeTypes[attrDef.type].cast(lit, _objectSpread({}, opt, {
    attr: attrDef
  }));
};

exports.default = _default;
module.exports = exports.default;