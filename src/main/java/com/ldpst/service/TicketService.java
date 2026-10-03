package com.ldpst.service;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ldpst.controller.websocket.DataChangedEvent;
import com.ldpst.model.domain.*;
import com.ldpst.model.dto.Command.TicketSearch;
import com.ldpst.repository.EventRepository;
import com.ldpst.repository.PersonRepository;
import com.ldpst.repository.TicketRepository;
import com.ldpst.repository.VenuesRepository;
import com.ldpst.service.specification.TicketSpecification;
import com.ldpst.service.util.NotFoundException;


import com.ldpst.model.dto.Command.PageResult;
import com.ldpst.model.dto.Command.TicketCommand;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;
    private final VenuesRepository venuesRepository;
    private final PersonRepository personRepository;
    private final ApplicationEventPublisher publisher;

    public TicketService(TicketRepository ticketRepository, EventRepository eventRepository,
            VenuesRepository venuesRepository, PersonRepository personRepository, ApplicationEventPublisher applicationEventPublisher) {
        this.ticketRepository = ticketRepository;
        this.eventRepository = eventRepository;
        this.personRepository = personRepository;
        this.venuesRepository = venuesRepository;
        this.publisher = applicationEventPublisher;
    }

    @Transactional(readOnly = true)
    public PageResult<Ticket> findAll(TicketSearch ts) {
        Sort sort = Sort.by(ts.ascending() ? Sort.Direction.ASC : Sort.Direction.DESC, ts.sort());

        Pageable pageable = PageRequest.of(ts.page(), ts.size(), sort);

        Specification<Ticket> spec = TicketSpecification.filter(ts.filterField(), ts.filter());

        Page<Ticket> page = ticketRepository.findAll(spec, pageable);

        return new PageResult<Ticket>(page.getContent(), page.getTotalElements(), page.getTotalPages(), ts.page(),
                ts.size());
    }

    @Transactional(readOnly = true)
    public Ticket get(int id) {
        return ticketRepository.findById(id).orElseThrow(() -> new NotFoundException("Билет не найден"));
    }

    @Transactional 
    public Ticket create(TicketCommand c) {
        Ticket t = new Ticket();
        apply(t, c);

        Ticket managed = ticketRepository.save(t);
        registerChange("ticket-updated");
        return managed;
    }

    @Transactional
    public Ticket update(int id, TicketCommand c) {
        Ticket ticket = get(id);
        apply(ticket, c);
        Ticket managed = ticketRepository.save(ticket);
        registerChange("ticket-updated");
        return managed;
    }

    @Transactional 
    public void delete(int id) {
        Ticket ticket = get(id);
        ticketRepository.delete(ticket);
        registerChange("ticket-deleted");
    }

    private void apply(Ticket t, TicketCommand c) {
        Coordinates p = new Coordinates();
        p.setX(c.coordinates().x());
        p.setY(c.coordinates().y());

        t.setName(c.name().trim());
        t.setCoordinates(p);
        t.setPrice(c.price());
        t.setType(c.type());
        t.setDiscount(c.discount());
        t.setNumber(c.number());

        Person person = personRepository.findById(c.personId())
                .orElseThrow(() -> new NotFoundException("Человек не найден"));
        Event event = eventRepository.findById(c.eventId())
                .orElseThrow(() -> new NotFoundException("Событие не найдено"));
        Venue venue = venuesRepository.findById(c.venueId())
                .orElseThrow(() -> new NotFoundException("Площадка не найдена"));

        t.setPerson(person);
        t.setEvent(event);
        t.setVenue(venue);
    }

    public void registerChange(String msg) {
        publisher.publishEvent(new DataChangedEvent(msg));
    }
}
