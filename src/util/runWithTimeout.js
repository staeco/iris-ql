export const setSession = async (timeout, conn, opt) =>
  conn.query(`
    SET statement_timeout = ${parseInt(timeout)};
    SET idle_in_transaction_session_timeout = ${parseInt(timeout)};
  `.trim(), opt)

export const setLocal = async (timeout, conn, opt) =>
  conn.query(`
    SET LOCAL statement_timeout = ${parseInt(timeout)};
    SET LOCAL idle_in_transaction_session_timeout = ${parseInt(timeout)};
  `.trim(), opt)

export default async (fn, { timeout, sequelize, debug }) =>
  sequelize.transaction(async (transaction) => {
    const qopt = { transaction, logging: debug }
    await setLocal(timeout, sequelize, qopt)
    return fn(transaction, sequelize)
  })
