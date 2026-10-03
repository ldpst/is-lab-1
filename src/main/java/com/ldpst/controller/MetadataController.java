package com.ldpst.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ldpst.model.domain.Color;
import com.ldpst.model.domain.Country;
import com.ldpst.model.domain.TicketType;

@RestController
@RequestMapping("/api/metadata")
public class MetadataController {
    @GetMapping
    public Map<String, Object> metadata() {
        return Map.of("ticketTypes", TicketType.values(), "colors", Color.values(), "countries", Country.values());
    }
}
