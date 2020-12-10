-- outputs the year for a date given a start month
CREATE OR REPLACE FUNCTION get_custom_year(v timestamp, custom_year_start integer) RETURNS numeric AS $$
  SELECT CASE
  	WHEN date_part('month', v) >= custom_year_start THEN date_part('year', v)::numeric + 1
  	ELSE date_part('year', v)::numeric
  	END;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

-- outputs the quarter of a custom year for a date given a start month
CREATE OR REPLACE FUNCTION get_custom_quarter(v timestamp, custom_year_start integer) RETURNS numeric AS $$
  SELECT floor(((12 + date_part('month', v)::numeric - custom_year_start) % 12) / 3 ) + 1;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

-- outputs the month of a custom year for a date given a start month, rotated so 0 = the start month, and 12 = the end of the custom year
-- need to invert this? see browser/customYear.js
CREATE OR REPLACE FUNCTION get_custom_month(v timestamp, custom_year_start integer) RETURNS numeric AS $$
  SELECT ((12 + date_part('month', v)::numeric - custom_year_start) % 12) + 1;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

-- date_part wrapper
CREATE OR REPLACE FUNCTION date_part_with_custom(part text, v timestamp, custom_year_start integer) RETURNS numeric AS $$
BEGIN
  IF custom_year_start = 1 THEN
    RETURN date_part(replace(part, 'custom_', ''), v)::numeric;
  END IF;
  IF part = 'custom_year'
  THEN
    RETURN get_custom_year(v, custom_year_start);
  END IF;
  IF part = 'custom_quarter'
  THEN
    RETURN get_custom_quarter(v, custom_year_start);
  END IF;
  IF part = 'custom_month'
  THEN
    RETURN get_custom_month(v, custom_year_start);
  END IF;
  RETURN date_part(part, v);
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

-- date_trunc_with_custom utils
CREATE OR REPLACE FUNCTION trunc_custom_year(v timestamp, tz text, custom_year_start integer) RETURNS timestamptz AS $$
  SELECT make_timestamptz(get_custom_year(v, custom_year_start)::int - 1, custom_year_start, 1, 0, 0, 0, tz);
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION trunc_custom_quarter(v timestamp, tz text, custom_year_start integer) RETURNS timestamptz AS $$
DECLARE
  month_start timestamp;
BEGIN
  month_start := trunc_custom_year(v, tz, custom_year_start) + make_interval(months => (get_custom_quarter(v, custom_year_start)::int - 1) * 3);
  RETURN make_timestamptz(date_part('year', month_start)::int, date_part('month', month_start)::int, 1, 0, 0, 0, tz);
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

-- date_trunc wrapper
CREATE OR REPLACE FUNCTION date_trunc_with_custom(bucket text, v timestamptz, tz text, custom_year_start integer) RETURNS timestamptz AS $$
BEGIN
  IF custom_year_start = 1 THEN
    RETURN date_trunc(replace(bucket, 'custom_', ''), v, tz);
  END IF;

  IF bucket = 'custom_year'
  THEN
    RETURN trunc_custom_year(force_tz(v, tz), tz, custom_year_start);
  END IF;
  IF bucket = 'custom_quarter'
  THEN
    RETURN trunc_custom_quarter(force_tz(v, tz), tz, custom_year_start);
  END IF;
  RETURN date_trunc(bucket, v, tz);
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;
