//import { forEach } from 'lodash'
import isObject from 'is-pure-object'
import { fn } from 'sequelize'
import { lat, lon } from '../util/isValidCoordinate'
import intersects from '../util/intersects'
import { ValidationError } from '../errors'
import parseIffyDate from '../util/iffy/date'
import parseIffyNumber from '../util/iffy/number'
import parseIffyStringArray from '../util/iffy/stringArray'
//import Filter from '../Filter'
//import Ordering from '../Ordering'

export default (query, opt={}) => {
  const errors = []
  const { table } = opt
  if (!table) throw new Error('Missing table!')
  const attrs = table.rawAttributes
  const initialFieldLimit = opt.fieldLimit || Object.keys(attrs)
  /*
  const popt = {
    ...opt,
    fieldLimit: opt.fieldLimit || Object.keys(attrs)
  }
  */

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
        path: [ 'search' ],
        value: query.search,
        message: 'Must be a string.'
      })
    }
    if (!isSearchable) {
      errors.push({
        path: [ 'search' ],
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
        path: [ 'before' ],
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
        path: [ 'after' ],
        value: query.after,
        message: 'Not a valid date!'
      })
    }
  }

  // if they defined a geo bounding box
  if (query.within) {
    if (!isObject(query.within)) {
      errors.push({
        path: [ 'within' ],
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
          path: [ 'within', 'xmin' ],
          value: xmin,
          message: xminIssue
        })
      }
      if (yminIssue !== true) {
        errors.push({
          path: [ 'within', 'ymin' ],
          value: ymin,
          message: yminIssue
        })
      }
      if (xmaxIssue !== true) {
        errors.push({
          path: [ 'within', 'xmax' ],
          value: xmax,
          message: xmaxIssue
        })
      }
      if (ymaxIssue !== true) {
        errors.push({
          path: [ 'within', 'ymax' ],
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
        path: [ 'intersects' ],
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
          path: [ 'intersects', 'x' ],
          value: x,
          message: lonIssue
        })
      }
      if (latIssue !== true) {
        errors.push({
          path: [ 'intersects', 'y' ],
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
          path: [ 'exclusions', idx ],
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
        path: [ 'limit' ],
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
        path: [ 'offset' ],
        value: query.offset,
        message: 'Invalid offset.'
      })
    }
  }

  // filterings
  /*
  if (query.filters) {
    if (typeof query.filters !== 'object') {
      errors.push({
        path: [ 'filters' ],
        value: query.filters,
        message: 'Must be an object or array.'
      })
    } else {
      out.where.push(new Filter(query.filters, popt).value())
    }
  }

  // ordering
  if (query.orderings) {
    if (!Array.isArray(query.orderings)) {
      errors.push({
        path: [ 'orderings' ],
        value: query.orderings,
        message: 'Must be an array.'
      })
    } else {
      forEach(query.orderings, ({ value, direction }={}, idx) => {
        const isDirectionValid = direction === 'asc' || direction === 'desc'
        if (!value) {
          errors.push({
            path: [ 'orderings', idx, 'value' ],
            value,
            message: 'Missing ordering value.'
          })
        }
        if (!direction) {
          errors.push({
            path: [ 'orderings', idx, 'direction' ],
            value: direction,
            message: 'Missing ordering direction.'
          })
        }
        if (!isDirectionValid) {
          errors.push({
            path: [ 'orderings', idx, 'direction' ],
            value: direction,
            message: 'Invalid ordering direction - must be asc or desc.'
          })
        }

        if (direction && value && isDirectionValid) {
          try {
            out.order.push([
              new QueryValue(value, popt).value(),
              direction
            ])
          } catch (err) {
            errors.push({
              path: [ 'orderings', idx, 'value' ],
              value,
              message: err.message
            })
          }
        }
      })
    }
  }
  */

  if (errors.length !== 0) throw new ValidationError(errors)
  return out
}
