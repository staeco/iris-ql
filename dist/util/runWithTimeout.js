"use strict";

exports.__esModule = true;
exports.default = void 0;

var _default = async (fn, {
  timeout,
  sequelize
}) => sequelize.transaction(async transaction => {
  await sequelize.query(`SET LOCAL statement_timeout = ${parseInt(timeout)};`, {
    transaction
  });
  return fn(transaction);
});

exports.default = _default;
module.exports = exports.default;