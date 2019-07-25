import { forEach } from 'lodash'
import isObject from 'is-pure-object'
import { fn } from 'sequelize'
import { lat, lon } from '../util/isValidCoordinate'
import intersects from '../util/intersects'
import { ValidationError } from '../errors'
import parseIffyDate from '../util/iffy/date'
import parseIffyNumber from '../util/iffy/number'
import parseIffyStringArray from '../util/iffy/stringArray'
import Filter from '../Filter'
import Ordering from '../Ordering'

export default (query, opt={}) => {
  const errors = []
  const { table, context=[] } = opt
  if (!table) throw new Error('Missing table!')
  const attrs = table.rawAttributes
  const initialFieldLimit = opt.fieldLimit || Object.keys(attrs)
  const popt = {
    ...opt,
    fieldLimit: initialFieldLimit
  }

  // options we pass on, default in fieldLimit
  const out = {
    where: [
      {} // very dumb fix for https://github.com/sequelize/sequelize/issues/10142
    ],
    order: []
  }

  // searching
  if (query.search) {
    const searchable = initialFieldLimit.filter((k) => attrs[k].searchable)
    const isSearchable = searchable.length !== 0
    const isValid = typeof query.search === 'string'
    if (!isValid) {
      errors.push({
        path: [ ...context, 'search' ],
        value: query.search,
        message: 'Must be a string.'
      })
    }
    if (!isSearchable) {
      errors.push({
        path: [ ...context, 'search' ],
        value: query.search,
        message: 'Endpoint does not support search.'
      })
    }
    if (isValid && isSearchable) {
      const trimmed = query.search.trim()
      out.where.push({
        $or: searchable.map((f) => ({ [f]: { $iLike: `%${trimmed}%` } }))
      })
    }
  }

  // broad time ranges
  if (query.before) {
    try {
      const beforeVal = parseIffyDate(query.before)
      out.where.push({
        $or: [
          { createdAt: { $lt: beforeVal } },
          { updatedAt: { $lt: beforeVal } }
        ]
      })
    } catch (err) {
      errors.push({
        path: [ ...context, 'before' ],
        value: query.before,
        message: 'Not a valid date!'
      })
    }
  }
  if (query.after) {
    try {
      const afterVal = parseIffyDate(query.after)
      out.where.push({
        $or: [
          { createdAt: { $gt: afterVal } },
          { updatedAt: { $gt: afterVal } }
        ]
      })
    } catch (err) {
      errors.push({
        path: [ ...context, 'after' ],
        value: query.after,
        message: 'Not a valid date!'
      })
    }
  }

  // if they defined a geo bounding box
  if (query.within) {
    if (!isObject(query.within)) {
      errors.push({
        path: [ ...context, 'within' ],
        value: query.within,
        message: 'Must be an object.'
      })
    } else {
      const { xmin, ymin, xmax, ymax } = query.within
      const actualXMin = parseIffyNumber(xmin)
      const actualYMin = parseIffyNumber(ymin)
      const actualXMax = parseIffyNumber(xmax)
      const actualYMax = parseIffyNumber(ymax)
      const xminIssue = lon(actualXMin)
      const xmaxIssue = lon(actualXMax)
      const yminIssue = lat(actualYMin)
      const ymaxIssue = lat(actualYMax)
      if (xminIssue !== true) {
        errors.push({
          path: [ ...context, 'within', 'xmin' ],
          value: xmin,
          message: xminIssue
        })
      }
      if (yminIssue !== true) {
        errors.push({
          path: [ ...context, 'within', 'ymin' ],
          value: ymin,
          message: yminIssue
        })
      }
      if (xmaxIssue !== true) {
        errors.push({
          path: [ ...context, 'within', 'xmax' ],
          value: xmax,
          message: xmaxIssue
        })
      }
      if (ymaxIssue !== true) {
        errors.push({
          path: [ ...context, 'within', 'ymax' ],
          value: ymax,
          message: ymaxIssue
        })
      }
      const box = fn('ST_MakeEnvelope', actualXMin, actualYMin, actualXMax, actualYMax)
      out.where.push(intersects(box, { table }))
    }
  }

  // if they defined a point
  if (query.intersects) {
    if (!isObject(query.intersects)) {
      errors.push({
        path: [ ...context, 'intersects' ],
        value: query.intersects,
        message: 'Must be an object.'
      })
    } else {
      const { x, y } = query.intersects
      const actualX = parseIffyNumber(x)
      const actualY = parseIffyNumber(y)
      const latIssue = lat(actualY)
      const lonIssue = lon(actualX)
      if (lonIssue !== true) {
        errors.push({
          path: [ ...context, 'intersects', 'x' ],
          value: x,
          message: lonIssue
        })
      }
      if (latIssue !== true) {
        errors.push({
          path: [ ...context, 'intersects', 'y' ],
          value: y,
          message: latIssue
        })
      }
      out.where.push(intersects(fn('ST_Point', actualX, actualY), { table }))
    }
  }

  // exclusions
  if (query.exclusions) {
    const parsed = parseIffyStringArray(query.exclusions).map((k, idx) => {
      const [ first ] = k.split('.')
      if (!first || !attrs[first] || !initialFieldLimit.includes(first)) {
        errors.push({
          path: [ ...context, 'exclusions', idx ],
          value: k,
          message: 'Invalid exclusion.'
        })
        return null
      }
      return k
    })
    out.attributes = { exclude: parsed }
  }

  // limit
  if (query.limit) {
    try {
      out.limit = parseIffyNumber(query.limit)
    } catch (err) {
      errors.push({
        path: [ ...context, 'limit' ],
        value: query.limit,
        message: 'Invalid limit.'
      })
    }
  }

  // offset
  if (query.offset) {
    try {
      out.offset = parseIffyNumber(query.offset)
    } catch (err) {
      errors.push({
        path: [ ...context, 'offset' ],
        value: query.offset,
        message: 'Invalid offset.'
      })
    }
  }

  // filterings
  if (query.filters) {
    if (typeof query.filters !== 'object') {
      errors.push({
        path: [ ...context, 'filters' ],
        value: query.filters,
        message: 'Must be an object or array.'
      })
    } else {
      out.where.push(new Filter(query.filters, {
        ...popt,
        context: [ ...context, 'filters' ]
      }).value())
    }
  }

  // ordering
  if (query.orderings) {
    if (!Array.isArray(query.orderings)) {
      errors.push({
        path: [ ...context, 'orderings' ],
        value: query.orderings,
        message: 'Must be an array.'
      })
    } else {
      forEach(query.orderings, (v, idx) => {
        out.order.push(new Ordering(v, {
          ...popt,
          context: [ ...context, 'orderings', idx ]
        }).value())
      })
    }
  }

  if (errors.length !== 0) throw new ValidationError(errors)
  return out
}
