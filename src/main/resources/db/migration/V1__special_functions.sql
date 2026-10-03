CREATE OR REPLACE FUNCTION islab1.delete_tickets_by_venue(
    p_venue_id BIGINT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    affected BIGINT;
BEGIN
    DELETE FROM islab1.tickets
    WHERE venue_id = p_venue_id;

    GET DIAGNOSTICS affected = ROW_COUNT;

    RETURN affected;
END;
$$;


CREATE OR REPLACE FUNCTION islab1.count_tickets_by_venue_capacity_greater(
    p_capacity BIGINT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    affected BIGINT;
BEGIN
    SELECT COUNT(*)
    INTO affected
    FROM islab1.tickets t
    JOIN islab1.venues v ON v.id = t.venue_id
    WHERE v.capacity > p_capacity;

    RETURN affected;
END;
$$;


CREATE OR REPLACE FUNCTION islab1.unique_ticket_venues()
RETURNS TABLE (
    id BIGINT,
    name VARCHAR(255),
    capacity INTEGER,
    address_street VARCHAR(255),
    address_zip_code VARCHAR(255)
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
        SELECT v.id, v.name, v.capacity, v.address_street, v.address_zip_code
        FROM islab1.venues v
        WHERE EXISTS (
            SELECT 1
            FROM islab1.tickets t
            WHERE t.venue_id = v.id
        )
        ORDER BY v.id;
END;
$$;


CREATE OR REPLACE FUNCTION islab1.cancel_event(
    p_event_id BIGINT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    affected BIGINT;
BEGIN
    DELETE FROM islab1.tickets
    WHERE event_id = p_event_id;

    GET DIAGNOSTICS affected = ROW_COUNT;

    RETURN affected;
END;
$$;


CREATE OR REPLACE FUNCTION islab1.delete_tickets_by_person(
    p_person_id BIGINT
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    affected BIGINT;
BEGIN
    DELETE FROM islab1.tickets
    WHERE person_id = p_person_id;

    GET DIAGNOSTICS affected = ROW_COUNT;

    RETURN affected;
END;
$$;
