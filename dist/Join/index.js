"use strict";

exports.__esModule = true;
exports.default = void 0;

var _parse = _interopRequireDefault(require("./parse"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Join {
  constructor(obj, options = {}) {
    this.value = () => this._parsed;

    this.toJSON = () => this.input;

    if (!obj) throw new Error('Missing value!');
    if (!options.model || !options.model.rawAttributes) throw new Error('Missing model!');
    this.input = obj;
    this.options = options;
    this._parsed = (0, _parse.default)(obj, options);
  }

}

exports.default = Join;
module.exports = exports.default;