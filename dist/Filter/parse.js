"use strict";

exports.__esModule = true;
exports.default = void 0;
var _operators = _interopRequireDefault(require("../operators"));
var _errors = require("../errors");
var _isPlainObj = _interopRequireDefault(require("is-plain-obj"));
var _fixJSONFilters = require("../util/fixJSONFilters");
var _isQueryValue = _interopRequireDefault(require("../util/isQueryValue"));
var _QueryValue = _interopRequireDefault(require("../QueryValue"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const reserved = new Set(Object.keys(_operators.default));
function _ref3(acc, [k, v]) {
  return (0, _fixJSONFilters.hydrate)(acc, {
    ...v,
    from: k !== 'parent' ? k : undefined
  });
}
var _default = (obj, opt) => {
  const {
    context = []
  } = opt;
  const error = new _errors.ValidationError();
  // recursively walk a filter object and replace query values with the real thing
  const transformValues = (v, parent = '', idx) => {
    const ctx = idx != null ? [...context, idx] : context;
    if ((0, _isQueryValue.default)(v)) {
      return new _QueryValue.default(v, {
        ...opt,
        context: ctx,
        hydrateJSON: false // we do this later anyways
      }).value();
    }
    if (Array.isArray(v)) return v.map((i, idx) => transformValues(i, parent, idx));
    function _ref2(p, k) {
      let fullPath;
      // verify

      function _ref(e) {
        return {
          ...e,
          path: [...ctx, ...fullPath.split('.')]
        };
      }
      if (!reserved.has(k)) {
        fullPath = `${parent}${parent ? '.' : ''}${k}`;
        try {
          new _QueryValue.default({
            field: fullPath
          }, {
            ...opt,
            context: ctx,
            hydrateJSON: false
          }); // performs the check, don't need the value
        } catch (err) {
          if (!err.fields) {
            error.add(err);
          } else {
            error.add(err.fields.map(_ref));
          }
          return p;
        }
      }
      p[k] = transformValues(v[k], fullPath || parent, idx);
      return p;
    }
    if ((0, _isPlainObj.default)(v)) {
      return Object.keys(v).reduce(_ref2, {});
    }
    return v;
  };
  const transformed = transformValues(obj);
  // turn where object into string with fields hydrated
  if (!error.isEmpty()) throw error;
  const out = (0, _fixJSONFilters.hydrate)((0, _fixJSONFilters.unwrap)(transformed, opt), opt);
  if (!opt.joins) return out;

  // run through all of our joins and fix those up too
  return Object.entries(opt.joins).reduce(_ref3, out);
};
exports.default = _default;
module.exports = exports.default;