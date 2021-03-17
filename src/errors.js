import { inspect } from 'util'

const inspectOptions = {
  depth: 100,
  breakLength: Infinity
}

const serializeIssues = (fields) =>
  fields.map((f) => `\n - ${inspect(f, inspectOptions)}`)

export class BadRequestError extends Error {
  name = 'BadRequestError'
  constructor(message = 'Bad Request', status = 400) {
    super(message)
    this.status = status
    Error.captureStackTrace(this, BadRequestError)
  }
  toString = () =>
    `${super.toString()} (HTTP ${this.status})`
}

export class ValidationError extends BadRequestError {
  name = 'ValidationError'
  constructor(fields = []) {
    super('Validation Error')
    this.fields = []
    if (fields) this.add(fields)
    Error.captureStackTrace(this, ValidationError)
  }
  add = (err) => {
    if (!err) return this // nothing to do
    if (err.fields) {
      this.fields.push(...err.fields)
    } else if (err instanceof Error) {
      throw err
    } else if (Array.isArray(err)) {
      this.fields.push(...err)
    } else {
      this.fields.push(err)
    }
    this.message = this.toString() // update msg

    if (err.stack) {
      this.stack = err.stack
    } else {
      Error.captureStackTrace(this, this.add)
    }
    return this
  }
  removePath = (path) => {
    this.fields = this.fields.filter((f) =>
      !f.path || !path.every((p, idx) => f.path[idx] === p)
    )
    this.message = this.toString() // update msg
  }
  isEmpty = () =>
    this.fields.length === 0

  toString = () => {
    const original = 'Error: Validation Error'
    if (this.isEmpty()) return original // no custom validation
    return `${original}\nIssues:${serializeIssues(this.fields)}`
  }
}
