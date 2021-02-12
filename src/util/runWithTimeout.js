export default async (fn, { timeout, sequelize, debug }) =>
  sequelize.transaction(async (transaction) => {
    const qopt = { transaction, logging: debug }
    await sequelize.query(`
      SET LOCAL statement_timeout = ${parseInt(timeout)};
      SET LOCAL idle_in_transaction_session_timeout = ${parseInt(timeout)};
    `.trim(), qopt)
    return fn(transaction, sequelize)
  })
