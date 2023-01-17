"use strict";

exports.__esModule = true;
exports.default = void 0;
var _momentTimezone = _interopRequireDefault(require("moment-timezone"));
var _errors = require("../errors");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/* eslint-disable no-magic-numbers */

const zones = new Set(_momentTimezone.default.tz.names());
var _default = (query, {
  context = []
}) => {
  const error = new _errors.ValidationError();
  const out = {};

  // if user specified a timezone, tack it on so downstream stuff in types/query knows about it
  if (query.timezone) {
    if (typeof query.timezone !== 'string') {
      error.add({
        path: [...context, 'timezone'],
        value: query.timezone,
        message: 'Must be a string.'
      });
    } else {
      if (!zones.has(query.timezone)) {
        error.add({
          path: [...context, 'timezone'],
          value: query.timezone,
          message: 'Not a valid timezone.'
        });
      } else {
        out.timezone = query.timezone;
      }
    }
    delete query.timezone;
  }
  // if user specified a customYearStart, tack it on so downstream stuff in types/query knows about it
  if (query.customYearStart) {
    if (typeof query.customYearStart !== 'number') {
      error.add({
        path: [...context, 'customYearStart'],
        value: query.customYearStart,
        message: 'Must be a number.'
      });
    } else {
      if (query.customYearStart < 1 || query.customYearStart > 12) {
        error.add({
          path: [...context, 'customYearStart'],
          value: query.customYearStart,
          message: 'Not a valid month.'
        });
      } else {
        out.customYearStart = query.customYearStart;
      }
    }
    delete query.customYearStart;
  }
  if (!error.isEmpty()) throw error;
  return out;
};
exports.default = _default;
module.exports = exports.default;