const table = ({ model, instanceQuery=true }) => instanceQuery ? model.name : model.getTableName()

export const where = ({ value, model, instanceQuery=true }) =>
  model.sequelize.dialect.QueryGenerator.getWhereConditions(value, table({ model, instanceQuery }), model)

export const value = ({ value, model, instanceQuery=true }) =>
  model.sequelize.dialect.QueryGenerator.handleSequelizeMethod(value, table({ model, instanceQuery }), model)

export const jsonPath = ({ column, model, path, instanceQuery=true }) => {
  const ncol = model.sequelize.dialect.QueryGenerator.jsonPathExtractionQuery(column, path)
    // remove parens it puts on for literally no reason
    .replace(/^\(/, '')
    .replace(/\)$/, '')
  return `"${table({ model, instanceQuery })}".${ncol}`
}

export const column = ({ column, model, instanceQuery=true }) => {
  const ncol = model.sequelize.dialect.QueryGenerator.quoteIdentifier(column)
  return `"${table({ model, instanceQuery })}".${ncol}`
}

export const select = ({ value, model }) =>
  model.sequelize.dialect.QueryGenerator.selectQuery(model.getTableName(), value, model)
