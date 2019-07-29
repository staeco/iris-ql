"use strict";

exports.__esModule = true;
exports.default = void 0;

var _parse = _interopRequireDefault(require("./parse"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class QueryValue {
  constructor(obj, options = {}) {
    this.value = () => this._parsed;

    this.toJSON = () => this.input;

    if (!obj) throw new Error('Missing value!');
    if (!options.table) throw new Error('Missing table!');
    this.input = obj;
    this.options = options;
    this._parsed = (0, _parse.default)(obj, options);
  }

}

exports.default = QueryValue;
module.exports = exports.default;