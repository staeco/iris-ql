"use strict";

exports.__esModule = true;
exports.force = exports.shift = void 0;

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _sequelize = _interopRequireDefault(require("sequelize"));

var _errors = require("../errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const zones = new Set(_momentTimezone.default.tz.names());

const shift = (v, {
  timezone
} = {}) => {
  if (!timezone) return v;
  if (!zones.has(timezone)) throw new _errors.BadRequestError('Not a valid timezone');
  const offset = _momentTimezone.default.tz(timezone).utcOffset() / 60; // utcOffset is in minutes, convert to hours

  return _sequelize.default.fn('shift_tz', v, offset);
};

exports.shift = shift;

const force = (v, {
  timezone
} = {}) => {
  if (!timezone) return v;
  if (!zones.has(timezone)) throw new _errors.BadRequestError('Not a valid timezone');
  return _sequelize.default.fn('force_tz', v, timezone);
};

exports.force = force;