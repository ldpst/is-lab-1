package com.ldpst.service;

import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ldpst.controller.websocket.DataChangedEvent;
import com.ldpst.model.domain.Address;
import com.ldpst.model.domain.Venue;
import com.ldpst.model.dto.Command.VenueCommand;
import com.ldpst.repository.VenuesRepository;
import com.ldpst.service.util.NotFoundException;

@Service
public class VenueService {
    private final VenuesRepository venuesRepository;
    private final ApplicationEventPublisher publisher;

    public VenueService(VenuesRepository venuesRepository, ApplicationEventPublisher applicationEventPublisher) {
        this.venuesRepository = venuesRepository;
        this.publisher = applicationEventPublisher;
    }

    @Transactional 
    public List<Venue> venues() {
        return venuesRepository.findAll();
    }

    @Transactional 
    public Venue save(Long id, VenueCommand c) {
        Venue v = id == null ? new Venue()
                : venuesRepository.findById(id).orElseThrow(() -> new NotFoundException("Площадка не найдено"));

        apply(v, c);
        Venue managed = venuesRepository.save(v);
        registerChange("references-changed");

        return managed;
    }

    @Transactional 
    public void delete(Long id) {
        Venue e = venuesRepository.findById(id).orElseThrow(() -> new NotFoundException("Площадка не найдена"));
        venuesRepository.delete(e);
        registerChange("references-changed");
    }

    private void apply(Venue v, VenueCommand c) {
        Address a = new Address();
        a.setStreet(
                c.address().street() == null || c.address().street().isBlank() ? null : c.address().street().trim());
        a.setZipCode(c.address().zipCode().trim());
        v.setName(c.name().trim());
        v.setCapacity(c.capacity());
        v.setAddress(a);
    }

    private void registerChange(String msg) {
        publisher.publishEvent(new DataChangedEvent(msg));
    }
}
