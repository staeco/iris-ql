"use strict";

exports.__esModule = true;
exports.default = void 0;

var _isPlainObject = _interopRequireDefault(require("is-plain-object"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = v => (0, _isPlainObject.default)(v) && (v.function || v.field);

exports.default = _default;
module.exports = exports.default;