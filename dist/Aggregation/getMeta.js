"use strict";

exports.__esModule = true;
exports.default = void 0;

var _lodash = require("lodash");

var _capitalize = _interopRequireDefault(require("capitalize"));

var _decamelize = _interopRequireDefault(require("decamelize"));

var _getTypes = _interopRequireDefault(require("../types/getTypes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const fmt = v => _capitalize.default.words((0, _decamelize.default)(v, ' '));

var _default = (agg, opt = {}) => {
  const types = (0, _getTypes.default)(agg.value, opt);
  if (types.length === 0) return; // no types? weird

  const primaryType = types[0];
  let fieldSchema;

  if (agg.value.field) {
    if (agg.value.field.includes('.')) {
      const [head, tail] = agg.value.field.split('.');
      fieldSchema = opt.subSchemas[head][tail];
    } else {
      fieldSchema = opt.model.rawAttributes[agg.field];
    }
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