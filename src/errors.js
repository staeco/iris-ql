import { inspect } from 'util'

const inspectOptions = {
  depth: 100,
  breakLength: Infinity
}

const serializeIssues = (fields) =>
  fields.map((f) => `\n - ${inspect(f, inspectOptions)}`)

export class BadRequestError extends Error {
  constructor(message='Bad Request', status=400) {
    super(message)
    this.message = message
    this.status = status
    Error.captureStackTrace(this, BadRequestError)
  }
  toString = () =>
    `${super.toString()} (HTTP ${this.status})`
}

export class ValidationError extends BadRequestError {
  constructor(fields=[]) {
    super('Validation Error')
    this.fields = Array.isArray(fields) ? fields : [ fields ]
    this.message = this.toString()
    Error.captureStackTrace(this, ValidationError)
  }
  add = (err) => {
    if (err.fields) {
      this.fields.push(...err.fields)
      return this
    }
    if (err instanceof Error) throw err
    this.fields.push(err)
    this.message = this.toString() // update msg
    return this
  }
  isEmpty = () =>
    this.fields.length === 0

  toString = () => {
    const original = 'Error: Validation Error'
    if (this.isEmpty()) return original // no custom validation
    return `${original}\nIssues:${serializeIssues(this.fields)}`
  }
}
