// sequelize < 6 uses QueryGenerator, > 6 uses queryGenerator
const getQueryGenerator = (model) => model.sequelize.dialect.queryGenerator || model.sequelize.dialect.QueryGenerator

const table = ({ model, instanceQuery = true }) => instanceQuery ? model.name : model.getTableName()

export const where = ({ value, model, from, instanceQuery = true }) =>
  getQueryGenerator(model).getWhereConditions(value, from || table({ model, instanceQuery }), model)

export const value = ({ value, model, from, instanceQuery = true }) =>
  getQueryGenerator(model).handleSequelizeMethod(value, from || table({ model, instanceQuery }), model)

export const jsonPath = ({ column, model, path, from, instanceQuery = true }) => {
  const ncol = getQueryGenerator(model).jsonPathExtractionQuery(column, path)
    // remove parens it puts on for literally no reason
    .replace(/^\(/, '')
    .replace(/\)$/, '')
  const tbl = getQueryGenerator(model).quoteIdentifier(from || table({ model, instanceQuery }))
  return `${tbl}.${ncol}`
}

export const identifier = ({ value, model }) => getQueryGenerator(model).quoteIdentifier(value)

export const column = ({ column, model, from, instanceQuery = true }) => {
  const ncol = getQueryGenerator(model).quoteIdentifier(column)
  const tbl = getQueryGenerator(model).quoteIdentifier(from || table({ model, instanceQuery }))
  return `${tbl}.${ncol}`
}

export const select = ({ value, model, from, analytics }) => {
  const nv = { ...value }

  // prep work findAll usually does
  if (!analytics) {
    // sequelize < 5.10
    if (model._conformOptions) {
      model._injectScope(nv)
      model._conformOptions(nv, model)
      model._expandIncludeAll(nv)
    } else {
      model._injectScope(nv)
      model._conformIncludes(nv, model)
      model._expandAttributes(nv)
      model._expandIncludeAll(nv)
    }
  }

  return getQueryGenerator(model).selectQuery(from || model.getTableName(), nv, model)
}

export const join = ({ value, model, alias }) => {
  const qg = getQueryGenerator(model)
  // types.literal('LEFT JOIN x AS "" ON y')
  const where = qg.whereItemsQuery(value, {
    prefix: qg.sequelize.literal(qg.quoteIdentifier(alias)),
    model
  })
  return `LEFT JOIN ${qg.quoteIdentifier(model.getTableName())} AS ${qg.quoteIdentifier(alias)} ON ${where}`
}
