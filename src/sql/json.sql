CREATE OR REPLACE FUNCTION jsonb_array_to_text_array(p_input jsonb) RETURNS text[] AS $$
  SELECT array_agg(x) FROM jsonb_array_elements_text(p_input) t(x);
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION json_array_to_text_array(p_input json) RETURNS text[] AS $$
  SELECT array_agg(x) FROM json_array_elements_text(p_input) t(x);
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION fix_jsonb_array(p_input text) RETURNS text[] AS $$
  SELECT null_if_empty_array(jsonb_array_to_text_array(p_input::jsonb))
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;

CREATE OR REPLACE FUNCTION fix_json_array(p_input text) RETURNS text[] AS $$
  SELECT null_if_empty_array(json_array_to_text_array(p_input::json))
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE
RETURNS NULL ON NULL INPUT;


CREATE OR REPLACE FUNCTION jsonb_diff(val1 JSONB, val2 JSONB) RETURNS JSONB AS $$
DECLARE
    result JSONB;
    object_result JSONB;
    i int;
    v RECORD;
BEGIN
    IF jsonb_typeof(val1) = 'null'
    THEN
        RETURN val2;
    END IF;

    result = val1;
    FOR v IN SELECT * FROM jsonb_each(val1) LOOP
        result = result || jsonb_build_object(v.key, null);
    END LOOP;

    FOR v IN SELECT * FROM jsonb_each(val2) LOOP
        -- if both fields are objects, recurse to get deep diff
        IF jsonb_typeof(val1->v.key) = 'object' AND jsonb_typeof(val2->v.key) = 'object'
        THEN
            object_result = jsonb_diff_val(val1->v.key, val2->v.key);
            -- check if result is not empty
            IF object_result = '{}'::jsonb THEN
                result = result - v.key; --if empty remove
            ELSE
                result = result || jsonb_build_object(v.key, object_result);
            END IF;
        -- if they are equal, remove the key
        ELSIF val1->v.key = val2->v.key THEN
            result = result - v.key;
        -- if they are different, add to the diff
        ELSE
            result = result || jsonb_build_object(v.key, v.value);
        END IF;
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE;

CREATE OR REPLACE FUNCTION jsonb_merge(a jsonb, b jsonb) RETURNS JSONB AS $$
  select
    jsonb_object_agg(
        coalesce(ka, kb),
        case
            when va isnull then vb
            when vb isnull then va
            when jsonb_typeof(va) <> 'object' or jsonb_typeof(vb) <> 'object' then vb
            else jsonb_merge(va, vb) end
        )
  from jsonb_each(a) e1(ka, va)
  full join jsonb_each(b) e2(kb, vb) on ka = kb
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE;


CREATE OR REPLACE FUNCTION get_label_from_json(p_input jsonb) RETURNS text AS $$
  SELECT coalesce(p_input->>'name', p_input->>'type', p_input->>'id', NULL);
$$
LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;
