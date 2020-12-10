import moment from 'moment-timezone'

/**
 * Used to generate an object containing metadata for a custom year
 * @param {number} customYearStart 1-based month number (i.e. 1 for January)
 * @param {date} [now=new Date()] optional date to use in calcs
 * @returns {object} returns an object containing the custom year name, start date, and end date
 */
export const getCustomYear = (customYearStart, now = new Date()) => {
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

export const rotateMonth = (customYearStart, v) => {
  if (customYearStart == null || customYearStart === 1) return v
  if (v + customYearStart - 1 === 12) return 12
  return (12 + v - 1 + customYearStart) % 12
}
