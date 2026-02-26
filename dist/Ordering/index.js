"use strict";

exports.__esModule = true;
exports.default = void 0;
var _parse = _interopRequireDefault(require("./parse"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Ordering {
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
exports.default = Ordering;
module.exports = exports.default;