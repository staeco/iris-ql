const functions = require('../dist/types/functions')

Object.values(functions).forEach((v) => {
  if (!v.name) return
  console.log(`${v.name} - ${v.notes}`)
})
