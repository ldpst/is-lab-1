package com.ldpst.service;

import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ldpst.controller.websocket.DataChangedEvent;
import com.ldpst.model.domain.Venue;
import com.ldpst.repository.SpecialOperationRepository;

@Service 
public class SpecialService {
    private final SpecialOperationRepository specialOperationRepository;
    private final ApplicationEventPublisher publisher;

    public SpecialService(SpecialOperationRepository specialOperationRepository, ApplicationEventPublisher publisher) {
        this.specialOperationRepository = specialOperationRepository;
        this.publisher = publisher;
    }

    @Transactional
    public long deleteByVenue(long venueId) {
        long deleted = specialOperationRepository.deleteTicketsByVenue(venueId);
        registerChange(deleted);
        return deleted;
    }

    @Transactional(readOnly = true)
    public long countCapacityGreater(long capacity) {
        return specialOperationRepository.countTicketsByVenueCapacityGreater(capacity);
    }

    @Transactional(readOnly = true)
    public List<Venue> uniqueVenues() {
        return specialOperationRepository.findUniqueTicketVenues();
    }

    @Transactional
    public long cancelEvent(long eventId) {
        long deleted = specialOperationRepository.cancelEvent(eventId);
        registerChange(deleted);
        return deleted;
    }

    @Transactional
    public long deleteByPerson(long personId) {
        long deleted = specialOperationRepository.deleteTicketsByPerson(personId);
        registerChange(deleted);
        return deleted;
    }

    private void registerChange(long deleted) {
        if (deleted > 0) {
            publisher.publishEvent(new DataChangedEvent("tickets-changed"));
        }
    }
}
