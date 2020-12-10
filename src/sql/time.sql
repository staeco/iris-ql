-- date_part has a different type sig on 12 and 13 so just make it numeric everywhere
-- on 13 its integer, 12 its double precision
CREATE OR REPLACE FUNCTION force_tz(base_date timestamptz, tz text) RETURNS timestamp AS $$
  SELECT base_date AT TIME ZONE tz;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION time_to_ms(a timestamptz) RETURNS numeric AS $$
  SELECT date_part('epoch', a)::numeric * 1000;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION time_to_ms(a timestamp) RETURNS numeric AS $$
  SELECT date_part('epoch', a)::numeric * 1000;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION parse_iso(a text) RETURNS timestamptz AS $$
  SELECT to_timestamp(a, 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;
