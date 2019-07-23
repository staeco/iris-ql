export const where = (db, { value, tableName, Model }) =>
  db.dialect.QueryGenerator.getWhereConditions(value, tableName, Model)

export const value = (db, { value, tableName, Model }) =>
  db.dialect.QueryGenerator.handleSequelizeMethod(value, tableName, Model)

export const select = (db, { value, tableName, Model }) =>
  db.dialect.QueryGenerator.selectQuery(tableName, value, tableName, Model)

export const jsonPath = (db, { column, resource, path }) => {
  const ncol = db.dialect.QueryGenerator.jsonPathExtractionQuery(column, path)
    // remove parens it puts on for literally no reason
    .replace(/^\(/, '')
    .replace(/\)$/, '')
  return `"${resource}".${ncol}`
}
