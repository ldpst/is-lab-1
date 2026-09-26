package com.ldpst.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.ldpst.model.domain.Ticket;
import com.ldpst.model.dto.Command.TicketSearch;
import com.ldpst.repository.TicketRepository;
import com.ldpst.service.specification.TicketSpecification;
import com.ldpst.model.dto.Command.PageResult;

@Service 
public class TicketService {
    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public PageResult<Ticket> findAll(TicketSearch ts) {
        Sort sort = Sort.by(ts.ascending() ? Sort.Direction.ASC : Sort.Direction.DESC, ts.sort());
        
        Pageable pageable = PageRequest.of(ts.page(), ts.size(), sort);
        
        Specification<Ticket> spec = TicketSpecification.filter(ts.filterField(), ts.filter());

        Page<Ticket> page = ticketRepository.findAll(spec, pageable);

        return new PageResult<Ticket>(page.getContent(), page.getTotalElements(), page.getTotalPages(), ts.page(), ts.size());
    }
}
