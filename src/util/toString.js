// sequelize < 6 uses QueryGenerator, > 6 uses queryGenerator
const getQueryGenerator = (model) => model.sequelize.dialect.queryGenerator || model.sequelize.dialect.QueryGenerator

const table = ({ model, instanceQuery = true }) => instanceQuery ? model.name : model.getTableName()

export const where = ({ value, model, instanceQuery = true }) =>
  getQueryGenerator(model).getWhereConditions(value, table({ model, instanceQuery }), model)

export const value = ({ value, model, instanceQuery = true }) =>
  getQueryGenerator(model).handleSequelizeMethod(value, table({ model, instanceQuery }), model)

export const jsonPath = ({ column, model, path, instanceQuery = true }) => {
  const ncol = getQueryGenerator(model).jsonPathExtractionQuery(column, path)
    // remove parens it puts on for literally no reason
    .replace(/^\(/, '')
    .replace(/\)$/, '')
  return `"${table({ model, instanceQuery })}".${ncol}`
}

export const column = ({ column, model, instanceQuery = true }) => {
  const ncol = getQueryGenerator(model).quoteIdentifier(column)
  return `"${table({ model, instanceQuery })}".${ncol}`
}

export const select = ({ value, model }) =>
  getQueryGenerator(model).selectQuery(model.getTableName(), value, model)
