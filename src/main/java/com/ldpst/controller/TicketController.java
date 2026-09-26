package com.ldpst.controller;

import org.springframework.web.bind.annotation.RestController;

import com.ldpst.service.TicketService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.ldpst.controller.api.ApiMapper;
import com.ldpst.controller.api.ApiModel.*;
import com.ldpst.model.domain.Ticket;
import com.ldpst.model.dto.Command.*;



@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    private final TicketService ticketService;
    private final ApiMapper mapper;

    public TicketController(TicketService ticketService, ApiMapper mapper) {
        this.ticketService = ticketService;
        this.mapper = mapper;
    }
    
    @GetMapping 
    public PageDto<TicketDto> list(@RequestParam(defaultValue="0") @Min(0) int page,
       @RequestParam(defaultValue="20") @Min(1) @Max(100) int size,
       @RequestParam(defaultValue="id") String sort, @RequestParam(defaultValue="asc") String direction,
       @RequestParam(required=false) String filterField, @RequestParam(required=false) String filter) {

        PageResult<Ticket> result = ticketService.findAll(new TicketSearch(page, size, sort, !"desc".equalsIgnoreCase(direction), filterField, filter));
        
        return new PageDto<TicketDto>(result.items().stream().map(mapper::ticket).toList(), result.totalItems(), result.totalPages(), result.page(), result.size());
    }
}
