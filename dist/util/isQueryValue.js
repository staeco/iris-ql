"use strict";

exports.__esModule = true;
exports.default = void 0;

var _isPlainObj = _interopRequireDefault(require("is-plain-obj"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = v => (0, _isPlainObj.default)(v) && (v.function || v.field);

exports.default = _default;
module.exports = exports.default;