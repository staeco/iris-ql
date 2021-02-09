export default async (fn, { timeout, sequelize }) =>
  sequelize.transaction(async (transaction) => {
    await sequelize.query(`SET LOCAL statement_timeout = ${parseInt(timeout)};`, { transaction })
    return fn(transaction)
  })
