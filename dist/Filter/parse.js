"use strict";

exports.__esModule = true;
exports.default = void 0;

var _operators = _interopRequireDefault(require("../operators"));

var _getJSONField = _interopRequireDefault(require("../util/getJSONField"));

var _castFields = _interopRequireDefault(require("../util/castFields"));

var _errors = require("../errors");

var _isPureObject = _interopRequireDefault(require("is-pure-object"));

var _QueryValue = _interopRequireDefault(require("../QueryValue"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const reserved = new Set(Object.keys(_operators.default));

const isQueryValue = v => v && (v.function || v.field || v.as);

var _default = (obj, opt) => {
  const {
    model,
    context = [],
    fieldLimit = Object.keys(model.rawAttributes)
  } = opt;
  const error = new _errors.ValidationError(); // recursively walk a filter object and replace query values with the real thing

  const transformValues = (v, parent = '') => {
    if (isQueryValue(v)) return new _QueryValue.default(v, _objectSpread({}, opt, {
      castJSON: false
    })).value(); // keep it raw, we cast it all later

    if (Array.isArray(v)) return v.map(i => transformValues(i, parent));

    function _ref(p, k) {
      let fullPath; // verify

      if (!reserved.has(k)) {
        fullPath = `${parent}${parent ? '.' : ''}${k}`;

        if (fullPath.includes('.')) {
          (0, _getJSONField.default)(fullPath, opt); // performs the check, don't need the value
        } else {
          if (fieldLimit && !fieldLimit.includes(fullPath)) {
            error.add({
              path: [...context, ...fullPath.split('.')],
              value: k,
              message: `Field does not exist.`
            });
            return p;
          }
        }
      }

      p[k] = transformValues(v[k], fullPath || parent);
      return p;
    }

    if ((0, _isPureObject.default)(v)) {
      return Object.keys(v).reduce(_ref, {});
    }

    return v;
  };

  const transformed = transformValues(obj); // turn where object into string with fields casted

  if (!error.isEmpty()) throw error;
  return (0, _castFields.default)(transformed, opt);
};

exports.default = _default;
module.exports = exports.default;