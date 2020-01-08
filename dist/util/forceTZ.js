"use strict";

exports.__esModule = true;
exports.default = exports.validate = void 0;

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _errors = require("../errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const zones = new Set(_momentTimezone.default.tz.names());

const validate = tz => {
  if (!zones.has(tz)) throw new _errors.BadRequestError('Not a valid timezone');
};

exports.validate = validate;

var _default = (v, {
  timezone
} = {}) => {
  if (!timezone) return v;
  if (!zones.has(timezone)) throw new _errors.BadRequestError('Not a valid timezone');
  return _sequelize.default.fn('force_tz', v, timezone);
};

exports.default = _default;