"use strict";

exports.__esModule = true;
exports.default = void 0;
var _isPlainObj = _interopRequireDefault(require("is-plain-obj"));
var _parse = _interopRequireDefault(require("./parse"));
var _export = _interopRequireDefault(require("../util/export"));
var _getTypes = _interopRequireDefault(require("../types/getTypes"));
var _getModelFieldLimit = _interopRequireDefault(require("../util/getModelFieldLimit"));
var _runWithTimeout = _interopRequireDefault(require("../util/runWithTimeout"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class Query {
  constructor(obj, options = {}) {
    this.update = fn => {
      if ((0, _isPlainObj.default)(fn)) return this.update(v => ({
        ...v,
        ...fn
      }));
      if (typeof fn !== 'function') throw new Error('Missing update function!');

      // update instance query
      const newInstanceValue = fn(this._parsed);
      if (!newInstanceValue || typeof newInstanceValue !== 'object') throw new Error('Invalid update function! Must return an object.');
      this._parsed = newInstanceValue;

      // update non-instance query
      const newCollectionValue = fn(this._parsedCollection);
      if (!newCollectionValue || typeof newCollectionValue !== 'object') throw new Error('Invalid update function! Must return an object.');
      this._parsedCollection = newCollectionValue;
      return this;
    };
    this.constrain = ({
      defaultLimit,
      maxLimit,
      attributes,
      where
    } = {}) => {
      if (where && !Array.isArray(where)) throw new Error('Invalid where array!');
      if (attributes && !Array.isArray(attributes)) throw new Error('Invalid attributes array!');
      return this.update(v => {
        const limit = v.limit || defaultLimit;
        return {
          ...v,
          attributes: attributes || v.attributes,
          where: where ? [...v.where, ...where] : v.where,
          limit: maxLimit ? limit ? Math.min(limit, maxLimit) : maxLimit : limit
        };
      });
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
      useMaster,
      debug = this.options.model.sequelize.options.logging,
      timeout
    } = {}) => {
      const fn = this.options.count !== false ? 'findAndCountAll' : 'findAll';
      const exec = transaction => this.options.model[fn]({
        raw,
        useMaster,
        logging: debug,
        transaction,
        ...this.value()
      });
      if (!timeout) return exec();
      return (0, _runWithTimeout.default)(exec, {
        sequelize: this.options.model.sequelize,
        timeout
      });
    };
    this.executeStream = async ({
      onError,
      format,
      tupleFraction,
      transform,
      useMaster,
      debug = this.options.model.sequelize.options.logging,
      timeout,
      finishTimeout
    } = {}) => (0, _export.default)({
      timeout,
      finishTimeout,
      useMaster,
      tupleFraction,
      format,
      transform,
      onError,
      debug,
      model: this.options.model,
      value: this.value()
    });
    this.count = async ({
      useMaster,
      timeout,
      debug = this.options.model.sequelize.options.logging
    } = {}) => {
      const exec = transaction => this.options.model.count({
        useMaster,
        transaction,
        logging: debug,
        ...this.value()
      });
      if (!timeout) return exec();
      return (0, _runWithTimeout.default)(exec, {
        sequelize: this.options.model.sequelize,
        timeout
      });
    };
    this.destroy = async ({
      debug = this.options.model.sequelize.options.logging,
      timeout
    } = {}) => {
      const exec = transaction => this.options.model.destroy({
        logging: debug,
        transaction,
        ...this.value({
          instanceQuery: false
        })
      });
      if (!timeout) return exec();
      return (0, _runWithTimeout.default)(exec, {
        sequelize: this.options.model.sequelize,
        timeout
      });
    };
    if (!obj) throw new Error('Missing query!');
    if (!options.model || !options.model.rawAttributes) throw new Error('Missing model!');
    if (options.fieldLimit && !Array.isArray(options.fieldLimit)) throw new Error('Invalid fieldLimit!');
    this.input = obj;
    this.options = options;
    this._parsed = (0, _parse.default)(obj, options);
    this._parsedCollection = (0, _parse.default)(obj, {
      ...options,
      instanceQuery: false
    });
  }
}
exports.default = Query;
module.exports = exports.default;