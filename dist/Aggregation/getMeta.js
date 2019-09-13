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
  var _fieldSchema, _fieldSchema2, _fieldSchema3;

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
    name: agg.name || ((_fieldSchema = fieldSchema) === null || _fieldSchema === void 0 ? void 0 : _fieldSchema.name) || fmt(agg.alias),
    notes: agg.notes || ((_fieldSchema2 = fieldSchema) === null || _fieldSchema2 === void 0 ? void 0 : _fieldSchema2.notes),
    type: primaryType.type,
    measurement: primaryType.measurement,
    validation: primaryType.validation || ((_fieldSchema3 = fieldSchema) === null || _fieldSchema3 === void 0 ? void 0 : _fieldSchema3.validation)
  });
};

exports.default = _default;
module.exports = exports.default;