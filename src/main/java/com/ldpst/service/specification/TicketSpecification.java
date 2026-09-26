package com.ldpst.service.specification;

import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;

import com.ldpst.model.domain.Ticket;

public class TicketSpecification {
    public static Specification<Ticket> filter(String field, String value) {
        if (value == null || value.isBlank())
            return Specification.unrestricted();

        String needle = "%" + value.trim().toLowerCase(Locale.ROOT) + "%";

        return (root, query, cb) -> switch (field == null ? "name" : field) {
            case "personPassportID", "personPassportId" ->
                cb.like(cb.lower(root.get("person").get("passportID")), needle);
            case "eventName" -> 
                cb.like(cb.lower(root.get("event").get("name")), needle);
            case "eventDescription" -> 
                cb.like(cb.lower(root.get("event").get("description")), needle);
            case "venueName" ->
                cb.like(cb.lower(root.get("venue").get("name")), needle);
            case "addressStreet" -> 
                cb.like(cb.lower(root.get("venue").get("address").get("street")), needle);
            case "addressZipCode" -> 
                cb.like(cb.lower(root.get("venue").get("address").get("zipCode")), needle);
            default -> 
                cb.like(cb.lower(root.get("name")), needle);
        };
    }
}