export const where = ({ value, model }) =>
  model.sequelize.dialect.QueryGenerator.getWhereConditions(value, model.name, model)

export const value = ({ value, model }) =>
  model.sequelize.dialect.QueryGenerator.handleSequelizeMethod(value, model.name, model)

export const jsonPath = ({ column, model, path }) => {
  const ncol = model.sequelize.dialect.QueryGenerator.jsonPathExtractionQuery(column, path)
    // remove parens it puts on for literally no reason
    .replace(/^\(/, '')
    .replace(/\)$/, '')
  return `"${model.name}".${ncol}`
}

export const select = ({ value, model }) =>
  model.sequelize.dialect.QueryGenerator.selectQuery(model.getTableName(), value, model)
