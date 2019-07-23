"use strict";

exports.__esModule = true;
exports.default = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _errors = require("../errors");

var funcs = _interopRequireWildcard(require("../functions"));

var _getJSONField = _interopRequireDefault(require("../util/getJSONField"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const baseParse = (v, opt) => {
  const {
    fieldLimit,
    castJSON = true
  } = opt;
  if (v == null) return null;

  if (v.function) {
    if (typeof v.function !== 'string') throw new _errors.BadRequestError('Invalid function name');
    const func = funcs[v.function];
    const args = v.arguments || [];
    if (!func) throw new _errors.BadRequestError(`Invalid function name - ${v.function}`);
    if (!Array.isArray(args)) throw new _errors.BadRequestError(`Invalid function arguments for ${v.function}`);
    return func(...args.map(i => parse(i, opt)));
  }

  if (v.field) {
    if (typeof v.field !== 'string') throw new _errors.BadRequestError('Invalid field name');
    if (v.field.includes('.')) return (0, _getJSONField.default)(v.field, _objectSpread({}, opt, {
      cast: castJSON
    }));
    if (fieldLimit && !fieldLimit.includes(v.field)) throw new _errors.BadRequestError(`Non-existent field: ${v.field}`);
    return _sequelize.default.col(v.field);
  }

  if (typeof v === 'string') {
    const slit = _sequelize.default.literal(_sequelize.default.escape(v));

    slit.raw = v; // expose raw value so functions can optionally take this as an argument

    return slit;
  }

  if (typeof v === 'object') throw new _errors.BadRequestError('Query object given was invalid');
  return v;
};

const parse = (v, ...rest) => {
  const ret = baseParse(v, ...rest);
  if (!v.as) return ret;
  if (typeof v.as !== 'string') throw new _errors.BadRequestError('as value given was invalid');
  return _sequelize.default.cast(ret, v.as);
};

var _default = parse;
exports.default = _default;
module.exports = exports.default;