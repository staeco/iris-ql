"use strict";

exports.__esModule = true;
exports.default = void 0;

var _parse = _interopRequireDefault(require("./parse"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Filter {
  constructor(obj, options = {}) {
    this.value = () => this.parsed;

    this.toJSON = () => this.input;

    if (!obj) throw new Error('Missing value!');
    if (!options.table) throw new Error('Missing table!');
    this.input = obj;
    this.options = options;
    this.parsed = (0, _parse.default)(obj, options);
  }

}

exports.default = Filter;
module.exports = exports.default;