"use strict";

exports.__esModule = true;
exports.default = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _isPlainObj = _interopRequireDefault(require("is-plain-obj"));

var _errors = require("../errors");

var _getTypes = _interopRequireDefault(require("../types/getTypes"));

var funcs = _interopRequireWildcard(require("../types/functions"));

var _getJSONField = _interopRequireDefault(require("../util/getJSONField"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _ref(i) {
  return i.value;
}

function _ref2(t) {
  return t.type;
}

const validateArgumentTypes = (func, sig, arg, opt) => {
  var _sig$options;

  if (sig.types === 'any') return true; // allows anything

  if (!sig.required && arg == null) return true; // not present, so has a default

  if (sig.required && arg == null) {
    throw new _errors.ValidationError({
      path: opt.context,
      value: arg,
      message: `Argument "${sig.name}" for "${func.name}" is required`
    });
  }

  const enumm = (_sig$options = sig.options) === null || _sig$options === void 0 ? void 0 : _sig$options.map(_ref);

  if (enumm && !enumm.includes(arg)) {
    throw new _errors.ValidationError({
      path: opt.context,
      value: arg,
      message: `Argument "${sig.name}" for "${func.name}" must be one of: ${enumm.join(', ')}`
    });
  }

  const argTypes = (0, _getTypes.default)(arg, opt).map(_ref2);
  const typesValid = argTypes.some(t => sig.types.includes(t));

  if (!typesValid) {
    throw new _errors.ValidationError({
      path: opt.context,
      value: arg,
      message: `Argument "${sig.name}" for "${func.name}" must be of type: ${sig.types.join(', ')} - instead got ${argTypes.length === 0 ? '<none>' : argTypes.join(', ')}`
    });
  }

  return true;
};

const getFunction = (v, opt) => {
  const {
    context = []
  } = opt;

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
  } // resolve function arguments, then check the types against the function signature


  const sigArgs = func.signature || [];
  const resolvedArgs = sigArgs.map((sig, idx) => {
    const nopt = _objectSpread({}, opt, {
      context: [...context, 'arguments', idx]
    });

    const argValue = args[idx];
    const parsed = parse(argValue, nopt);
    validateArgumentTypes(func, sig, argValue, nopt);
    return {
      types: (0, _getTypes.default)(argValue, nopt),
      raw: argValue,
      value: parsed
    };
  });
  return {
    fn: func,
    args: resolvedArgs
  };
};

const parse = (v, opt) => {
  const {
    model,
    fieldLimit = Object.keys(opt.model.rawAttributes),
    hydrateJSON = true,
    context = []
  } = opt;
  if (v == null) return null;

  if (typeof v === 'string' || typeof v === 'number') {
    return _sequelize.default.literal(model.sequelize.escape(v));
  }

  if (!(0, _isPlainObj.default)(v)) {
    throw new _errors.ValidationError({
      path: context,
      value: v,
      message: 'Must be a function, field, string, number, or object.'
    });
  }

  if (v.function) {
    const {
      fn,
      args
    } = getFunction(v, opt);
    return fn.execute(...args);
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
      hydrate: hydrateJSON
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

  if (v.val) {
    throw new _errors.ValidationError({
      path: [...context, 'val'],
      value: v.val,
      message: 'Must not contain a reserved key "val".'
    });
  }

  return v;
};

var _default = parse;
exports.default = _default;
module.exports = exports.default;