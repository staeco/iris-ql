"use strict";

exports.__esModule = true;
exports.default = void 0;

var _QueryValue = _interopRequireDefault(require("../QueryValue"));

var _errors = require("../errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = ({
  value,
  direction
} = {}, opt) => {
  const error = new _errors.ValidationError();
  let out;
  const {
    context = []
  } = opt;
  const isDirectionValid = direction === 'asc' || direction === 'desc';

  if (!value) {
    error.add({
      path: [...context, 'value'],
      value,
      message: 'Missing ordering value.'
    });
  }

  if (!direction) {
    error.add({
      path: [...context, 'direction'],
      value: direction,
      message: 'Missing ordering direction.'
    });
  }

  if (direction != null && !isDirectionValid) {
    error.add({
      path: [...context, 'direction'],
      value: direction,
      message: 'Invalid ordering direction - must be asc or desc.'
    });
  }

  if (direction && value && isDirectionValid) {
    try {
      out = [new _QueryValue.default(value, { ...opt,
        context: [...context, 'value']
      }).value(), direction];
    } catch (err) {
      error.add(err);
    }
  }

  if (!error.isEmpty()) throw error;
  return out;
};

exports.default = _default;
module.exports = exports.default;