import { inspect } from 'util'

const inspectOptions = {
  depth: 100,
  breakLength: Infinity
}

const serializeIssues = (fields) =>
  fields.map((f) => `\n - ${inspect(f, inspectOptions)}`)

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
  toString = () =>
    `${super.toString()} (HTTP ${this.status})`
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
    if (!this.fields) this.fields = []
    if (!Array.isArray(this.fields)) this.fields = [ this.fields ]
  }
  add = (err) => {
    if (err.fields) {
      this.fields.push(...err.fields)
      return this
    }
    if (err instanceof Error) throw err
    this.fields.push(err)
    return this
  }
  isEmpty = () =>
    this.fields.length === 0
  toString = () => {
    const original = super.toString()
    if (this.isEmpty()) return original // no custom validation
    return `${original}\nIssues:${serializeIssues(this.fields)}`
  }
}
