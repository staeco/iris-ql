"use strict";

exports.__esModule = true;
exports.default = void 0;
var _lodash = require("lodash");
var _capitalize = _interopRequireDefault(require("capitalize"));
var _decamelize = _interopRequireDefault(require("decamelize"));
var _getTypes = _interopRequireDefault(require("../types/getTypes"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const fmt = v => _capitalize.default.words((0, _decamelize.default)(v, {
  separator: ' '
}));
const getFieldSchema = (field, opt) => {
  if (field.includes('.')) {
    const [head, tail] = field.split('.');
    return opt.subSchemas[head][tail];
  }
  return opt.model.rawAttributes[field];
};
const getJoinSchema = (field, opt) => {
  const [join, ...rest] = field.split('.');
  return getFieldSchema(rest.join('.'), opt.joins?.[join.replace('~', '')]);
};
var _default = (agg, opt = {}) => {
  const types = (0, _getTypes.default)(agg.value, opt);
  if (types.length === 0) return; // no types? weird
  const primaryType = types[0];
  let fieldSchema;
  if (agg.value.field) {
    fieldSchema = agg.value.field.startsWith('~') ? getJoinSchema(agg.value.field, opt) : getFieldSchema(agg.value.field, opt);
  }
  return (0, _lodash.pickBy)({
    name: agg.name || fieldSchema?.name || fmt(agg.alias),
    notes: agg.notes || fieldSchema?.notes,
    type: primaryType.type,
    items: primaryType.items,
    measurement: primaryType.measurement,
    validation: primaryType.validation
  });
};
exports.default = _default;
module.exports = exports.default;