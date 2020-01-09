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

-- gets the timezone offset for a given date and zone
-- since DST exists you need to base it from the date, since the offset is variable
CREATE OR REPLACE FUNCTION tz_offset(base_date timestamptz, tz text) RETURNS interval AS $$
  SELECT INTERVAL '1 hour' * extract(hour from force_tz(base_date, tz) - force_tz(base_date, 'UTC'))
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

-- disaster so this works in PG11 which does not have date_trunc with tz param
-- takes the UTC time and manually shifts it
CREATE OR REPLACE FUNCTION shift_tz(base_date timestamptz, tz text) RETURNS timestamptz AS $$
  SELECT (base_date AT TIME ZONE 'UTC' - tz_offset(base_date, tz)) AT TIME ZONE 'UTC'
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;
