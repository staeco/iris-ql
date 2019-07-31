"use strict";

exports.__esModule = true;
exports.default = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _errors = require("../errors");

var _toString = require("./toString");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = ({
  aggregation,
  filters,
  model
}) => {
  if (!filters) throw new _errors.BadRequestError('Missing filters');
  if (!aggregation) throw new _errors.BadRequestError('Missing aggregation');
  const query = (0, _toString.where)({
    value: filters,
    model
  });
  const agg = (0, _toString.value)({
    value: aggregation,
    model
  });
  return _sequelize.default.literal(`${agg} FILTER (WHERE ${query})`);
};

exports.default = _default;
module.exports = exports.default;