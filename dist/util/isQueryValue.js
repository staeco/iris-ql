"use strict";

exports.__esModule = true;
exports.default = void 0;

var _isPureObject = _interopRequireDefault(require("is-pure-object"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = v => (0, _isPureObject.default)(v) && (v.function || v.field);

exports.default = _default;
module.exports = exports.default;