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

CREATE OR REPLACE FUNCTION parse_iso(a text, tz text) RETURNS timestamp AS $$
  SELECT to_timestamp(a, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AT TIME ZONE tz
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;
