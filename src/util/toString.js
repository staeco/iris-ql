export const where = ({ value, table }) =>
  table.sequelize.dialect.QueryGenerator.getWhereConditions(value, table.name, table)

export const value = ({ value, table }) =>
  table.sequelize.dialect.QueryGenerator.handleSequelizeMethod(value, table.name, table)

export const select = ({ value, table }) =>
  table.sequelize.dialect.QueryGenerator.selectQuery(table.name, value, table.name, table)

export const jsonPath = ({ column, table, path }) => {
  const ncol = table.sequelize.dialect.QueryGenerator.jsonPathExtractionQuery(column, path)
    // remove parens it puts on for literally no reason
    .replace(/^\(/, '')
    .replace(/\)$/, '')
  return `"${table.name}".${ncol}`
}
