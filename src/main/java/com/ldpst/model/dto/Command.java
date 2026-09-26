package com.ldpst.model.dto;

import com.ldpst.model.domain.Color;
import com.ldpst.model.domain.Country;
import com.ldpst.model.domain.TicketType;

public final class Command {
    // private ResultModel() {}
    // public record CoordinatesCommand(long x, Long y) {}

    // public record LocationCommand(Double x, Float y, String name) {}

    // public record AddressCommand(String street, String zipCode) {}

    // public record PersonCommand(Color eyeColor, Color hairColor, LocationCommand location, Integer weight,
    //                             String passportID, Country nationality) {}

    // public record EventCommand(String name, int minAge, String description) {}

    // public record VenueCommand(String name, int capacity, AddressCommand address) {}

    // public record TicketCommand(String name, CoordinatesCommand coordinates, Long personId, Long eventId,
    //                             float price, TicketType type, Float discount, Integer number, Long venueId) {}

    public record TicketSearch(int page, int size, String sort, boolean ascending, String filterField, String filter) {}

    public record PageResult<T>(java.util.List<T> items, long totalItems, int totalPages, int page, int size) {}
}
