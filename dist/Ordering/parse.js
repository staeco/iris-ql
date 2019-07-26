"use strict";

exports.__esModule = true;
exports.default = void 0;

var _QueryValue = _interopRequireDefault(require("../QueryValue"));

var _errors = require("../errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = ({
  value,
  direction
} = {}, opt) => {
  const error = new _errors.ValidationError();
  let out;
  const {
    table,
    context = []
  } = opt;
  if (!table) throw new Error('Missing table!');
  const isDirectionValid = direction === 'asc' || direction === 'desc';

  if (!value) {
    error.add({
      path: [...context, 'value'],
      value,
      message: 'Missing ordering value.'
    });
  }

  if (!direction) {
    error.add({
      path: [...context, 'direction'],
      value: direction,
      message: 'Missing ordering direction.'
    });
  }

  if (!isDirectionValid) {
    error.add({
      path: [...context, 'direction'],
      value: direction,
      message: 'Invalid ordering direction - must be asc or desc.'
    });
  }

  if (direction && value && isDirectionValid) {
    try {
      out = [new _QueryValue.default(value, _objectSpread({}, opt, {
        context: [...context, 'value']
      })).value(), direction];
    } catch (err) {
      error.add(err);
    }
  }

  if (!error.isEmpty()) throw error;
  return out;
};

exports.default = _default;
module.exports = exports.default;