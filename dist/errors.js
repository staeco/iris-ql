"use strict";

exports.__esModule = true;
exports.ValidationError = exports.BadRequestError = exports.codes = void 0;

var _util = require("util");

const inspectOptions = {
  depth: 100,
  breakLength: Infinity
};

function _ref(f) {
  return `\n - ${(0, _util.inspect)(f, inspectOptions)}`;
}

const serializeIssues = fields => fields.map(_ref);

const codes = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  serverError: 500
};
exports.codes = codes;

class BadRequestError extends Error {
  constructor(message = 'Bad Request', status = codes.badRequest) {
    super(message);

    this.toString = () => `${super.toString()} (HTTP ${this.status})`;

    this.message = message;
    this.status = status;
  }

}

exports.BadRequestError = BadRequestError;

class ValidationError extends BadRequestError {
  constructor(message, fields) {
    super();

    this.add = err => {
      if (err.fields) {
        this.fields.push(...err.fields);
        return this;
      }

      if (err instanceof Error) throw err;
      this.fields.push(err);
      return this;
    };

    this.isEmpty = () => this.fields.length === 0;

    this.toString = () => {
      const original = super.toString();
      if (this.isEmpty()) return original; // no custom validation

      return `${original}\nIssues:${serializeIssues(this.fields)}`;
    };

    if (message && fields) {
      this.message = message;
      this.fields = fields;
    }

    if (message && !fields) {
      this.fields = message;
    }

    if (!this.fields) this.fields = [];
    if (!Array.isArray(this.fields)) this.fields = [this.fields];
  }

}

exports.ValidationError = ValidationError;