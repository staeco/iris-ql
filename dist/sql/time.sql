CREATE OR REPLACE FUNCTION force_tz(base_date timestamptz, tz text) RETURNS timestamp AS $$
  SELECT base_date AT TIME ZONE tz
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION time_to_ms(a timestamptz) RETURNS numeric AS $$
  SELECT (date_part('epoch', a) * 1000)::numeric
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION time_to_ms(a timestamp) RETURNS numeric AS $$
  SELECT (date_part('epoch', a) * 1000)::numeric
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION parse_iso(a text) RETURNS timestamptz AS $$
  SELECT to_timestamp(a, 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

-- custom utils
CREATE OR REPLACE FUNCTION get_custom_year(v timestamp, custom_year_start integer) RETURNS numeric AS $$
  SELECT CASE
  	WHEN date_part('month', v) >= custom_year_start THEN date_part('year', v) + 1
  	ELSE date_part('year', v)
  	END;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION get_custom_year(v timestamptz, custom_year_start integer) RETURNS numeric AS $$
  SELECT CASE
  	WHEN date_part('month', v) >= custom_year_start THEN date_part('year', v) + 1
  	ELSE date_part('year', v)
  	END;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION get_custom_quarter(v timestamp, custom_year_start integer) RETURNS numeric AS $$
  SELECT floor(((12 + date_part('month', v)::integer - custom_year_start) % 12) / 3 ) + 1;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION get_custom_quarter(v timestamptz, custom_year_start integer) RETURNS numeric AS $$
  SELECT floor(((12 + date_part('month', v)::integer - custom_year_start) % 12) / 3 ) + 1;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

/*
need to invert this for some reason?
(v, customYearStart) =>
  if (v + customYearStart - 1 === 12) return 12
  return (12 + (v - 1) + custom_year_start) % 12
*/
CREATE OR REPLACE FUNCTION get_custom_month(v timestamp, custom_year_start integer) RETURNS numeric AS $$
  SELECT ((12 + date_part('month', v)::integer - custom_year_start) % 12) + 1;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION get_custom_month(v timestamptz, custom_year_start integer) RETURNS numeric AS $$
  SELECT ((12 + date_part('month', v)::integer - custom_year_start) % 12) + 1;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;


-- date_part wrappers
CREATE OR REPLACE FUNCTION date_part_with_custom(part text, v timestamp, custom_year_start integer) RETURNS numeric AS $$
BEGIN
  IF custom_year_start = 1 THEN
    RETURN date_part(replace(part, 'custom_', ''), v);
  END IF;
  IF part = 'custom_year' THEN
    RETURN get_custom_year(v, custom_year_start);
  END IF;
  IF part = 'custom_quarter' THEN
    RETURN get_custom_quarter(v, custom_year_start);
  END IF;
  IF part = 'custom_month' THEN
    RETURN get_custom_month(v, custom_year_start);
  END IF;
  RETURN date_part(part, v);
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION date_part_with_custom(part text, v timestamptz, custom_year_start integer) RETURNS numeric AS $$
BEGIN
  IF custom_year_start = 1 THEN
    RETURN date_part(replace(part, 'custom_', ''), v);
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

-- date_trunc wrappers
-- dont think this is needed? but leaving the stubs here just in case
/*
CREATE OR REPLACE FUNCTION date_trunc_with_custom(part text, v timestamp, custom_year_start integer) RETURNS timestamp AS $$
BEGIN
  RETURN date_trunc(part, v);
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;
CREATE OR REPLACE FUNCTION date_trunc_with_custom(part text, v timestamptz, custom_year_start integer) RETURNS timestamp AS $$
BEGIN
  RETURN date_trunc(part, v);
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION date_trunc_with_custom(part text, v timestamp, tz text, custom_year_start integer) RETURNS timestamptz AS $$
BEGIN
  RETURN date_trunc(part, v, tz);
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;
CREATE OR REPLACE FUNCTION date_trunc_with_custom(part text, v timestamptz, tz text, custom_year_start integer) RETURNS timestamptz AS $$
BEGIN
  RETURN date_trunc(part, v, tz);
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;
*/
