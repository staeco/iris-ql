"use strict";

exports.__esModule = true;
exports.default = void 0;

var _postgres = _interopRequireDefault(require("connections/postgres"));

var _errors = require("sutro/dist/errors");

var _aliases = _interopRequireDefault(require("connections/postgres/aliases"));

var _toString = require("../util/toString");

var _getJSONField = _interopRequireDefault(require("../util/getJSONField"));

var _QueryValue = _interopRequireDefault(require("../QueryValue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const reserved = new Set(Object.keys(_aliases.default));

const isObject = x => typeof x === 'object' && x !== null && !(x instanceof RegExp) && !(x instanceof Error) && !(x instanceof Date);

const isQueryValue = v => v && (v.function || v.field || v.as);

var _default = (obj, opt) => {
  const {
    dataType,
    table,
    fieldLimit
  } = opt; // recursively walk a filter object and replace query values with the real thing

  const transformValues = (v, parent = '') => {
    if (isQueryValue(v)) return new _QueryValue.default(v, _objectSpread({}, opt, {
      castJSON: false
    })).value(); // keep it raw, we cast it all later

    if (Array.isArray(v)) return v.map(i => transformValues(i, parent));

    if (isObject(v)) {
      return Object.keys(v).reduce((p, k) => {
        let fullPath; // verify

        if (!reserved.has(k)) {
          fullPath = `${parent}${parent ? '.' : ''}${k}`;

          if (fullPath.includes('.')) {
            (0, _getJSONField.default)(fullPath, opt); // performs the check, don't need the value
          } else {
            if (fieldLimit && !fieldLimit.includes(fullPath)) throw new _errors.BadRequestError(`Non-existent field: ${fullPath}`);
          }
        }

        p[k] = transformValues(v[k], fullPath || parent);
        return p;
      }, {});
    }

    return v;
  }; // turn where object into string with fields casted


  const castFields = v => {
    if (Array.isArray(v)) v = {
      $and: v // convert it

    };
    if (!dataType) return v; // no casting required!

    const str = (0, _toString.where)({
      value: v,
      table
    });
    const regex = new RegExp(`"${table.resource}"\\."(\\w*)"#>>'{(\\w*)}'`, 'g');
    const redone = str.replace(regex, (match, col, field) => {
      const lit = (0, _getJSONField.default)(`${col}.${field}`, opt);
      return (0, _toString.value)({
        value: lit,
        table
      });
    });
    return _postgres.default.literal(redone);
  };

  return castFields(transformValues(obj));
};

exports.default = _default;
module.exports = exports.default;