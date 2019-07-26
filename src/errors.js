import { inspect } from 'util'

const inspectOptions = {
  depth: 100,
  breakLength: Infinity
}

const serializeIssues = (fields) =>
  fields.map((f) => `\n - ${inspect(f, inspectOptions)}`)

export const merge = (errors, err) => {
  if (err.fields) {
    errors.push(...err.fields) // bubble up nested errors
    return
  }
  throw err
}

export const codes = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500
}

export class BadRequestError extends Error {
  constructor(message='Bad Request', status=codes.badRequest) {
    super(message)
    this.message = message
    this.status = status
  }
  toString() {
    return `${super.toString()} (HTTP ${this.status})`
  }
}

export class ValidationError extends BadRequestError {
  constructor(message, fields) {
    super()
    if (message && fields) {
      this.message = message
      this.fields = fields
    }
    if (message && !fields) {
      this.fields = message
    }
  }
  toString() {
    const original = super.toString()
    if (!this.fields) return original // no custom validation
    return `${original}\nIssues:${serializeIssues(this.fields)}`
  }
}
