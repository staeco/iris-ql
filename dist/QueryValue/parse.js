"use strict";

exports.__esModule = true;
exports.default = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _isPureObject = _interopRequireDefault(require("is-pure-object"));

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
    table,
    fieldLimit = Object.keys(opt.table.rawAttributes),
    castJSON = true,
    context = []
  } = opt;
  if (v == null) return null;

  function _ref(i, idx) {
    return parse(i, _objectSpread({}, opt, {
      context: [...context, 'arguments', idx]
    }));
  }

  if (v.function) {
    if (typeof v.function !== 'string') {
      throw new _errors.ValidationError({
        path: [...context, 'function'],
        value: v.function,
        message: 'Must be a string.'
      });
    }

    const func = funcs[v.function];
    const args = v.arguments || [];

    if (!func) {
      throw new _errors.ValidationError({
        path: [...context, 'function'],
        value: v.function,
        message: 'Function does not exist'
      });
    }

    if (!Array.isArray(args)) {
      throw new _errors.ValidationError({
        path: [...context, 'arguments'],
        value: v.function,
        message: 'Must be an array.'
      });
    }

    return func(...args.map(_ref));
  }

  if (v.field) {
    if (typeof v.field !== 'string') {
      throw new _errors.ValidationError({
        path: [...context, 'field'],
        value: v.field,
        message: 'Must be a string.'
      });
    }

    if (v.field.includes('.')) return (0, _getJSONField.default)(v.field, _objectSpread({}, opt, {
      cast: castJSON
    }));

    if (fieldLimit && !fieldLimit.includes(v.field)) {
      throw new _errors.ValidationError({
        path: [...context, 'field'],
        value: v.field,
        message: 'Field does not exist.'
      });
    }

    return _sequelize.default.col(v.field);
  }

  if (typeof v === 'string' || typeof v === 'number') {
    const slit = _sequelize.default.literal(table.sequelize.escape(v));

    slit.raw = v; // expose raw value so functions can optionally take this as an argument

    return slit;
  }

  if (!(0, _isPureObject.default)(v)) {
    throw new _errors.ValidationError({
      path: context,
      value: v,
      message: 'Must be a function, field, string, number, or object.'
    });
  } // TODO: is allowing an object here a security issue?


  return v;
};

const parse = (v, opt) => {
  const {
    context = []
  } = opt;
  const ret = baseParse(v, opt);
  if (!v.as) return ret;

  if (typeof v.as !== 'string') {
    throw new _errors.ValidationError({
      path: [...context, 'as'],
      value: v.as,
      message: 'Must be a string.'
    });
  }

  return _sequelize.default.cast(ret, v.as);
};

var _default = parse;
exports.default = _default;
module.exports = exports.default;