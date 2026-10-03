package com.ldpst.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ldpst.controller.api.ApiMapper;
import com.ldpst.controller.api.ApiModel.CountResultDto;
import com.ldpst.controller.api.ApiModel.DeleteResultDto;
import com.ldpst.controller.api.ApiModel.VenueDto;
import com.ldpst.service.SpecialService;

@RestController
@RequestMapping("/api/special")
public class SpecialController {
    private final SpecialService specialService;
    private final ApiMapper mapper;

    public SpecialController(SpecialService specialService, ApiMapper mapper) {
        this.specialService = specialService;
        this.mapper = mapper;
    }

    @DeleteMapping("/venues/{id}/tickets")
    public DeleteResultDto deleteVenueTickets(@PathVariable long id) {
        return new DeleteResultDto(specialService.deleteByVenue(id));
    }

    
    @GetMapping("/venues/capacity-greater/{capacity}/count")
    public CountResultDto count(@PathVariable int capacity) {
        return new CountResultDto(specialService.countCapacityGreater(capacity));
    }

    @GetMapping("/unique-venues")
    public List<VenueDto> venues() {
        return specialService.uniqueVenues().stream().map(mapper::venue).toList();
    }

    @DeleteMapping("/events/{id}/tickets")
    public DeleteResultDto cancel(@PathVariable long id) {
        return new DeleteResultDto(specialService.cancelEvent(id));
    }

    @DeleteMapping("/persons/{id}/tickets")
    public DeleteResultDto deletePersonTickets(@PathVariable long id) {
        return new DeleteResultDto(specialService.deleteByPerson(id));
    }
}
