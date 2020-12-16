"use strict";

exports.__esModule = true;
exports.default = void 0;

var _parse = _interopRequireDefault(require("./parse"));

var _export = _interopRequireDefault(require("../util/export"));

var _getTypes = _interopRequireDefault(require("../types/getTypes"));

var _getModelFieldLimit = _interopRequireDefault(require("../util/getModelFieldLimit"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Query {
  constructor(obj, options = {}) {
    this.update = fn => {
      if (typeof fn !== 'function') throw new Error('Missing update function!'); // update instance query

      const newInstanceValue = fn(this._parsed);
      if (!newInstanceValue || typeof newInstanceValue !== 'object') throw new Error('Invalid update function! Must return an object.');
      this._parsed = newInstanceValue; // update non-instance query

      const newCollectionValue = fn(this._parsedCollection);
      if (!newCollectionValue || typeof newCollectionValue !== 'object') throw new Error('Invalid update function! Must return an object.');
      this._parsedCollection = newCollectionValue;
      return this;
    };

    this.constrain = ({
      defaultLimit,
      maxLimit,
      where
    } = {}) => {
      if (where && !Array.isArray(where)) throw new Error('Invalid where array!');
      this.update(v => {
        const limit = v.limit || defaultLimit;
        return { ...v,
          where: where ? [...v.where, ...where] : v.where,
          limit: maxLimit ? limit ? Math.min(limit, maxLimit) : maxLimit : limit
        };
      });
      return this;
    };

    this.value = ({
      instanceQuery = true
    } = {}) => instanceQuery ? this._parsed : this._parsedCollection;

    this.toJSON = () => this.input;

    this.getOutputSchema = () => {
      let fieldLimit = this.options.fieldLimit || (0, _getModelFieldLimit.default)(this.options.model);

      if (this.input.exclusions) {
        fieldLimit = fieldLimit.filter(i => !this.input.exclusions.includes(i.field));
      }

      return fieldLimit.reduce((acc, f) => {
        acc[f.field] = (0, _getTypes.default)({
          field: f.field
        }, this.options)[0];
        return acc;
      }, {});
    };

    this.execute = async ({
      raw = false,
      useMaster
    } = {}) => {
      const fn = this.options.count !== false ? 'findAndCountAll' : 'findAll';
      return this.options.model[fn]({
        raw,
        useMaster,
        logging: this.options.debug,
        ...this.value()
      });
    };

    this.executeStream = async ({
      onError,
      format,
      tupleFraction,
      transform,
      useMaster
    } = {}) => (0, _export.default)({
      useMaster,
      tupleFraction,
      format,
      transform,
      onError,
      debug: this.options.debug,
      model: this.options.model,
      value: this.value()
    });

    this.count = async ({
      useMaster
    } = {}) => this.options.model.count({
      useMaster,
      logging: this.options.debug,
      ...this.value()
    });

    this.destroy = async () => this.options.model.destroy({
      logging: this.options.debug,
      ...this.value({
        instanceQuery: false
      })
    });

    if (!obj) throw new Error('Missing query!');
    if (!options.model || !options.model.rawAttributes) throw new Error('Missing model!');
    this.input = obj;
    this.options = options;
    this._parsed = (0, _parse.default)(obj, options);
    this._parsedCollection = (0, _parse.default)(obj, { ...options,
      instanceQuery: false
    });
  }

}

exports.default = Query;
module.exports = exports.default;