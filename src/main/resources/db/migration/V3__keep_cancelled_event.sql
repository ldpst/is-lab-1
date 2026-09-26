CREATE OR REPLACE FUNCTION fn_cancel_event(p_event_id BIGINT) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE affected BIGINT;
BEGIN
  DELETE FROM variant2.tickets WHERE event_id = p_event_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END $$;
