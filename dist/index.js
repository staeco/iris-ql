"use strict";

exports.__esModule = true;
exports.create = void 0;

var _Connection = _interopRequireDefault(require("./Connection"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const create = (pg, options) => new _Connection.default(pg, options);

exports.create = create;