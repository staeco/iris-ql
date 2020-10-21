"use strict";

exports.__esModule = true;
exports.default = void 0;

var _getScopedAttributes = _interopRequireDefault(require("../util/getScopedAttributes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _ref(f) {
  return {
    type: 'column',
    value: f
  };
}

var _default = model => Object.keys((0, _getScopedAttributes.default)(model)).map(_ref);

exports.default = _default;
module.exports = exports.default;