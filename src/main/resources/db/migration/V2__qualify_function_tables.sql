CREATE OR REPLACE FUNCTION fn_delete_tickets_by_venue(p_venue_id BIGINT) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE affected BIGINT;
BEGIN
  DELETE FROM variant2.tickets WHERE venue_id = p_venue_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END $$;
CREATE OR REPLACE FUNCTION fn_count_tickets_by_venue_capacity_greater(p_capacity INTEGER) RETURNS BIGINT LANGUAGE sql STABLE AS $$
  SELECT count(*) FROM variant2.tickets t JOIN variant2.venues v ON v.id = t.venue_id WHERE v.capacity > p_capacity
$$;
CREATE OR REPLACE FUNCTION fn_unique_ticket_venues() RETURNS TABLE(venue_id BIGINT) LANGUAGE sql STABLE AS $$
  SELECT DISTINCT t.venue_id FROM variant2.tickets t ORDER BY t.venue_id
$$;
CREATE OR REPLACE FUNCTION fn_cancel_event(p_event_id BIGINT) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE affected BIGINT;
BEGIN
  DELETE FROM variant2.tickets WHERE event_id = p_event_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  DELETE FROM variant2.events WHERE id = p_event_id;
  RETURN affected;
END $$;
CREATE OR REPLACE FUNCTION fn_delete_tickets_by_person(p_person_id BIGINT) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE affected BIGINT;
BEGIN
  DELETE FROM variant2.tickets WHERE person_id = p_person_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END $$;
