import moment from 'moment-timezone'

/**
 * Used to generate an object containing metadata for a custom year
 * A current use case is generating the getRange() key for a custom temporal
 * range dropdown option
 * @param {number} customYearStart 1-based month number (i.e. 1 for January)
 * @param {date} [now=new Date()] optional date to use in calcs
 * @returns {object} returns an object containing the custom year name, start date, and end date
 */
export const getCustomYear = (now = new Date(), customYearStart) => {
  const thisYear = now.getFullYear ? now.getFullYear() : now.year() // handle moment and plain js dates
  const thisMonth = (now.getMonth ? now.getMonth() : now.month()) + 1

  const startYear = thisMonth >= customYearStart ? thisYear : thisYear - 1
  const startDate = moment({ days: 1, months: customYearStart - 1, years: startYear })
  const endDate = moment(startDate).add(11, 'months').endOf('month')

  return {
    name: endDate.format('YYYY'),
    start: startDate.toISOString(),
    end: endDate.toISOString()
  }
}

export const rotateCustomMonth = (v, customYearStart) => {
  if (customYearStart == null || customYearStart === 1) return v // none set, will just default to jan in iris-ql anyways so no change needed
  // this is the inverse of the function get_custom_month in iris-ql
  // https://github.com/staeco/iris-ql/blob/master/src/sql/custom-year.sql#L18
  if (v + customYearStart - 1 === 12) return 12
  return (12 + v - 1 + customYearStart) % 12
}
export const getCustomQuarter = (v = new Date(), customYearStart) => {
  if (customYearStart == null || customYearStart === 1) return moment(v).quarter() // none set, will just default to jan in iris-ql anyways so no change needed
  // matches https://github.com/staeco/iris-ql/blob/master/src/sql/custom-year.sql#L11
  const month = moment(v).month() + 1
  // linter will tell you the parens arent needed, they are!
  // eslint-disable-next-line no-extra-parens
  return Math.floor(((12 + month - customYearStart) % 12) / 3) + 1
}
