"use strict";

exports.__esModule = true;
exports.default = exports.setLocal = exports.setSession = void 0;

const setSession = async (timeout, conn, opt) => conn.query(`
    SET statement_timeout = ${parseInt(timeout)};
    SET idle_in_transaction_session_timeout = ${parseInt(timeout)};
  `.trim(), opt);

exports.setSession = setSession;

const setLocal = async (timeout, conn, opt) => conn.query(`
    SET LOCAL statement_timeout = ${parseInt(timeout)};
    SET LOCAL idle_in_transaction_session_timeout = ${parseInt(timeout)};
  `.trim(), opt);

exports.setLocal = setLocal;

var _default = async (fn, {
  timeout,
  sequelize,
  debug
}) => sequelize.transaction(async transaction => {
  const qopt = {
    transaction,
    logging: debug
  };
  await setLocal(timeout, sequelize, qopt);
  return fn(transaction, sequelize);
});

exports.default = _default;