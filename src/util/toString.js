export const where = ({ value, model, instanceQuery=true }) =>
  model.sequelize.dialect.QueryGenerator.getWhereConditions(value, instanceQuery ? model.name : model.getTableName(), model)

export const value = ({ value, model, instanceQuery=true }) =>
  model.sequelize.dialect.QueryGenerator.handleSequelizeMethod(value, instanceQuery ? model.name : model.getTableName(), model)

export const jsonPath = ({ column, model, path, instanceQuery=true }) => {
  const ncol = model.sequelize.dialect.QueryGenerator.jsonPathExtractionQuery(column, path)
    // remove parens it puts on for literally no reason
    .replace(/^\(/, '')
    .replace(/\)$/, '')
  return `"${instanceQuery ? model.name : model.getTableName()}".${ncol}`
}

export const select = ({ value, model }) =>
  model.sequelize.dialect.QueryGenerator.selectQuery(model.getTableName(), value, model)
