"use strict";

exports.__esModule = true;
exports.default = void 0;
var _eachDeep = _interopRequireDefault(require("deepdash/eachDeep"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = (v, fn) => {
  const res = [];
  (0, _eachDeep.default)(v, (value, key, path) => {
    if (fn(key, value)) res.push({
      path,
      value
    });
  }, {
    pathFormat: 'array'
  });
  return res.length === 0 ? undefined : res;
};
exports.default = _default;
module.exports = exports.default;