import { QueryTypes } from 'sequelize'
import should from 'should'
import moment from 'moment-timezone'
import db from '../fixtures/db'

const timezone = 'America/Los_Angeles'

const select = async (q, returnSet = false, replacements) => {
  const res = await db.query(`select ${q}`, {
    type: QueryTypes.SELECT,
    plain: !returnSet,
    replacements
  })
  if (Array.isArray(res)) return res
  const keys = Object.keys(res)
  if (keys.length === 1) return res[keys[0]]
  return res
}

describe('sql#custom-year#time_to_ms', () => {
  it('should handle a basic date', async () => {
    const now = new Date()
    should(await select('time_to_ms(:time)', false, {
      time: now
    })).eql(now.getTime())
  })
})

describe('sql#custom-year#date_part_with_custom', () => {
  it('should fall back to regular date part if not custom', async () => {
    const start = 9 // october
    const check = async (date, part, expected) =>
      should(await select('date_part_with_custom(:part, :time, :start)', false, {
        part,
        time: new Date(date),
        start
      })).eql(expected)

    await check('1-1-2019', 'year', 2019)
    await check('2-1-2019', 'year', 2019)
    await check('3-1-2019', 'year', 2019)
    await check('4-1-2019', 'year', 2019)
    await check('5-1-2019', 'year', 2019)
    await check('6-1-2019', 'year', 2019)
    await check('7-1-2019', 'year', 2019)
    await check('8-1-2019', 'year', 2019)
    await check('9-1-2019', 'year', 2019)
    await check('10-1-2019', 'year', 2019)
    await check('11-1-2019', 'year', 2019)
    await check('12-1-2019', 'year', 2019)
    await check('1-1-2020', 'year', 2020)
    await check('2-1-2020', 'year', 2020)
    await check('3-1-2020', 'year', 2020)
    await check('4-1-2020', 'year', 2020)
    await check('5-1-2020', 'year', 2020)
    await check('6-1-2020', 'year', 2020)
    await check('7-1-2020', 'year', 2020)
    await check('8-1-2020', 'year', 2020)
    await check('9-1-2020', 'year', 2020)
    await check('10-1-2020', 'year', 2020)
    await check('11-1-2020', 'year', 2020)
    await check('12-1-2020', 'year', 2020)
  })
  it('should handle a basic october custom year, seeking year', async () => {
    const start = 9 // october
    const check = async (date, part, expected) =>
      should(await select('date_part_with_custom(:part, :time, :start)', false, {
        part,
        time: new Date(date),
        start
      })).eql(expected)

    await check('1-1-2019', 'custom_year', 2019)
    await check('2-1-2019', 'custom_year', 2019)
    await check('3-1-2019', 'custom_year', 2019)
    await check('4-1-2019', 'custom_year', 2019)
    await check('5-1-2019', 'custom_year', 2019)
    await check('6-1-2019', 'custom_year', 2019)
    await check('7-1-2019', 'custom_year', 2019)
    await check('8-1-2019', 'custom_year', 2019)
    await check('9-1-2019', 'custom_year', 2020)
    await check('10-1-2019', 'custom_year', 2020)
    await check('11-1-2019', 'custom_year', 2020)
    await check('12-1-2019', 'custom_year', 2020)
    await check('1-1-2020', 'custom_year', 2020)
    await check('2-1-2020', 'custom_year', 2020)
    await check('3-1-2020', 'custom_year', 2020)
    await check('4-1-2020', 'custom_year', 2020)
    await check('5-1-2020', 'custom_year', 2020)
    await check('6-1-2020', 'custom_year', 2020)
    await check('7-1-2020', 'custom_year', 2020)
    await check('8-1-2020', 'custom_year', 2020)
    await check('9-1-2020', 'custom_year', 2021)
    await check('10-1-2020', 'custom_year', 2021)
    await check('11-1-2020', 'custom_year', 2021)
    await check('12-1-2020', 'custom_year', 2021)
  })
  it('should handle a basic october custom year, seeking quarter', async () => {
    const start = 9 // october
    const check = async (date, part, expected) =>
      should(await select('date_part_with_custom(:part, :time, :start)', false, {
        part,
        time: new Date(date),
        start
      })).eql(expected)

    await check('1-1-2019', 'custom_quarter', 2)
    await check('2-1-2019', 'custom_quarter', 2)
    await check('3-1-2019', 'custom_quarter', 3)
    await check('4-1-2019', 'custom_quarter', 3)
    await check('5-1-2019', 'custom_quarter', 3)
    await check('6-1-2019', 'custom_quarter', 4)
    await check('7-1-2019', 'custom_quarter', 4)
    await check('8-1-2019', 'custom_quarter', 4)
    await check('9-1-2019', 'custom_quarter', 1)
    await check('10-1-2019', 'custom_quarter', 1)
    await check('11-1-2019', 'custom_quarter', 1)
    await check('12-1-2019', 'custom_quarter', 2)
  })
  it('should handle a basic october custom year, seeking month', async () => {
    const start = 9 // october
    const check = async (date, part, expected) =>
      should(await select('date_part_with_custom(:part, :time, :start)', false, {
        part,
        time: new Date(date),
        start
      })).eql(expected)

    await check('1-1-2019', 'custom_month', 5)
    await check('2-1-2019', 'custom_month', 6)
    await check('3-1-2019', 'custom_month', 7)
    await check('4-1-2019', 'custom_month', 8)
    await check('5-1-2019', 'custom_month', 9)
    await check('6-1-2019', 'custom_month', 10)
    await check('7-1-2019', 'custom_month', 11)
    await check('8-1-2019', 'custom_month', 12)
    await check('9-1-2019', 'custom_month', 1)
    await check('10-1-2019', 'custom_month', 2)
    await check('11-1-2019', 'custom_month', 3)
    await check('12-1-2019', 'custom_month', 4)
    await check('1-1-2020', 'custom_month', 5)
    await check('2-1-2020', 'custom_month', 6)
    await check('3-1-2020', 'custom_month', 7)
    await check('4-1-2020', 'custom_month', 8)
    await check('5-1-2020', 'custom_month', 9)
    await check('6-1-2020', 'custom_month', 10)
    await check('7-1-2020', 'custom_month', 11)
    await check('8-1-2020', 'custom_month', 12)
    await check('9-1-2020', 'custom_month', 1)
    await check('10-1-2020', 'custom_month', 2)
    await check('11-1-2020', 'custom_month', 3)
    await check('12-1-2020', 'custom_month', 4)
  })
})

describe('sql#custom-year#date_trunc_with_custom', () => {
  const start = 9 // october
  const check = async (date, bucket, expected) => {
    const time = moment.tz(date, 'MM-DD-YYYY', timezone).toISOString()
    const out = moment.tz(expected, 'MM-DD-YYYY', timezone).toISOString()
    const res = await select('date_trunc_with_custom(:bucket, :time, :timezone, :start)', false, {
      bucket,
      time,
      timezone,
      start
    })
    should(res.toISOString()).eql(out)
  }

  it('should fall back to regular date bucket if not custom', async () => {
    await check('1-1-2019', 'year', '1-1-2019')
    await check('2-1-2019', 'year', '1-1-2019')
    await check('3-1-2019', 'year', '1-1-2019')
    await check('4-1-2019', 'year', '1-1-2019')
    await check('5-1-2019', 'year', '1-1-2019')
    await check('6-1-2019', 'year', '1-1-2019')
    await check('7-1-2019', 'year', '1-1-2019')
    await check('8-1-2019', 'year', '1-1-2019')
    await check('9-1-2019', 'year', '1-1-2019')
    await check('10-1-2019', 'year', '1-1-2019')
    await check('11-1-2019', 'year', '1-1-2019')
    await check('12-1-2019', 'year', '1-1-2019')
    await check('1-1-2020', 'year', '1-1-2020')
    await check('2-1-2020', 'year', '1-1-2020')
    await check('3-1-2020', 'year', '1-1-2020')
    await check('4-1-2020', 'year', '1-1-2020')
    await check('5-1-2020', 'year', '1-1-2020')
    await check('6-1-2020', 'year', '1-1-2020')
    await check('7-1-2020', 'year', '1-1-2020')
    await check('8-1-2020', 'year', '1-1-2020')
    await check('9-1-2020', 'year', '1-1-2020')
    await check('10-1-2020', 'year', '1-1-2020')
    await check('11-1-2020', 'year', '1-1-2020')
    await check('12-1-2020', 'year', '1-1-2020')
  })
  it('should handle a basic october custom year, seeking year', async () => {
    await check('1-1-2019', 'custom_year', `${start}-1-2018`)
    await check('2-1-2019', 'custom_year', `${start}-1-2018`)
    await check('3-1-2019', 'custom_year', `${start}-1-2018`)
    await check('4-1-2019', 'custom_year', `${start}-1-2018`)
    await check('5-1-2019', 'custom_year', `${start}-1-2018`)
    await check('6-1-2019', 'custom_year', `${start}-1-2018`)
    await check('7-1-2019', 'custom_year', `${start}-1-2018`)
    await check('8-1-2019', 'custom_year', `${start}-1-2018`)
    await check('9-1-2019', 'custom_year', `${start}-1-2019`)
    await check('10-1-2019', 'custom_year', `${start}-1-2019`)
    await check('11-1-2019', 'custom_year', `${start}-1-2019`)
    await check('12-1-2019', 'custom_year', `${start}-1-2019`)
    await check('1-1-2020', 'custom_year', `${start}-1-2019`)
    await check('2-1-2020', 'custom_year', `${start}-1-2019`)
    await check('3-1-2020', 'custom_year', `${start}-1-2019`)
    await check('4-1-2020', 'custom_year', `${start}-1-2019`)
    await check('5-1-2020', 'custom_year', `${start}-1-2019`)
    await check('6-1-2020', 'custom_year', `${start}-1-2019`)
    await check('7-1-2020', 'custom_year', `${start}-1-2019`)
    await check('8-1-2020', 'custom_year', `${start}-1-2019`)
    await check('9-1-2020', 'custom_year', `${start}-1-2020`)
    await check('10-1-2020', 'custom_year', `${start}-1-2020`)
    await check('11-1-2020', 'custom_year', `${start}-1-2020`)
    await check('12-1-2020', 'custom_year', `${start}-1-2020`)
  })
  it('should handle a basic october custom year, seeking quarter', async () => {
    // Q1 = 9-1
    // Q2 = 12-1
    // Q3 = 3-1
    // Q4 = 6-1

    await check('1-1-2019', 'custom_quarter', '12-1-2018')
    await check('2-1-2019', 'custom_quarter', '12-1-2018')
    await check('3-1-2019', 'custom_quarter', '3-1-2019')
    await check('4-1-2019', 'custom_quarter', '3-1-2019')
    await check('5-1-2019', 'custom_quarter', '3-1-2019')
    await check('6-1-2019', 'custom_quarter', '6-1-2019')
    await check('7-1-2019', 'custom_quarter', '6-1-2019')
    await check('8-1-2019', 'custom_quarter', '6-1-2019')
    await check('9-1-2019', 'custom_quarter', '9-1-2019')
    await check('10-1-2019', 'custom_quarter', '9-1-2019')
    await check('11-1-2019', 'custom_quarter', '9-1-2019')
    await check('12-1-2019', 'custom_quarter', '12-1-2019')
  })
})
