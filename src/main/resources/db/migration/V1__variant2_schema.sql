CREATE TABLE persons (
    id BIGSERIAL PRIMARY KEY CHECK (id > 0),
    eye_color VARCHAR(16) CHECK (eye_color IS NULL OR eye_color IN ('GREEN','ORANGE','BROWN')),
    hair_color VARCHAR(16) NOT NULL CHECK (hair_color IN ('GREEN','ORANGE','BROWN')),
    location_x DOUBLE PRECISION NOT NULL,
    location_y REAL NOT NULL,
    location_name VARCHAR(255) NOT NULL CHECK (btrim(location_name) <> ''),
    weight INTEGER NOT NULL CHECK (weight > 0),
    passport_id VARCHAR(26),
    nationality VARCHAR(24) CHECK (nationality IS NULL OR nationality IN ('RUSSIA','FRANCE','INDIA','SOUTH_KOREA'))
);
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY CHECK (id > 0),
    name VARCHAR(255) NOT NULL CHECK (btrim(name) <> ''),
    min_age INTEGER NOT NULL,
    description TEXT NOT NULL CHECK (btrim(description) <> '')
);
CREATE TABLE venues (
    id BIGSERIAL PRIMARY KEY CHECK (id > 0),
    name VARCHAR(255) NOT NULL CHECK (btrim(name) <> ''),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    address_street VARCHAR(255),
    address_zip_code VARCHAR(255) NOT NULL CHECK (char_length(address_zip_code) >= 7)
);
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY CHECK (id > 0),
    name VARCHAR(255) NOT NULL CHECK (btrim(name) <> ''),
    coordinate_x BIGINT NOT NULL,
    coordinate_y BIGINT NOT NULL,
    creation_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    person_id BIGINT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    price REAL NOT NULL CHECK (price > 0),
    ticket_type VARCHAR(16) NOT NULL CHECK (ticket_type IN ('VIP','USUAL','BUDGETARY','CHEAP')),
    discount REAL CHECK (discount IS NULL OR (discount > 0 AND discount <= 100)),
    number INTEGER CHECK (number IS NULL OR number > 0),
    venue_id BIGINT NOT NULL REFERENCES venues(id) ON DELETE CASCADE
);
CREATE INDEX idx_tickets_person ON tickets(person_id);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_venue ON tickets(venue_id);

CREATE FUNCTION fn_delete_tickets_by_venue(p_venue_id BIGINT) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE affected BIGINT;
BEGIN
  DELETE FROM tickets WHERE venue_id = p_venue_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END $$;
CREATE FUNCTION fn_count_tickets_by_venue_capacity_greater(p_capacity INTEGER) RETURNS BIGINT LANGUAGE sql STABLE AS $$
  SELECT count(*) FROM tickets t JOIN venues v ON v.id = t.venue_id WHERE v.capacity > p_capacity
$$;
CREATE FUNCTION fn_unique_ticket_venues() RETURNS TABLE(venue_id BIGINT) LANGUAGE sql STABLE AS $$
  SELECT DISTINCT t.venue_id FROM tickets t ORDER BY t.venue_id
$$;
CREATE FUNCTION fn_cancel_event(p_event_id BIGINT) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE affected BIGINT;
BEGIN
  DELETE FROM tickets WHERE event_id = p_event_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  DELETE FROM events WHERE id = p_event_id;
  RETURN affected;
END $$;
CREATE FUNCTION fn_delete_tickets_by_person(p_person_id BIGINT) RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE affected BIGINT;
BEGIN
  DELETE FROM tickets WHERE person_id = p_person_id;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END $$;
