package com.ldpst.service;

import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ldpst.controller.websocket.DataChangedEvent;
import com.ldpst.model.domain.Event;
import com.ldpst.model.dto.Command.EventCommand;
import com.ldpst.repository.EventRepository;
import com.ldpst.service.util.NotFoundException;


@Service
public class EventService {
    private final EventRepository eventRepository;
    private final ApplicationEventPublisher publisher;


    public EventService(EventRepository eventRepository, ApplicationEventPublisher applicationEventPublisher) {
        this.eventRepository = eventRepository;
        this.publisher = applicationEventPublisher;
    }

    @Transactional 
    public List<Event> events() {
        return eventRepository.findAll();
    }

    @Transactional 
    public Event save(Long id, EventCommand c) {
        Event e = id == null ? new Event() : eventRepository.findById(id).orElseThrow(() -> new NotFoundException("Событие не найдено"));

        apply(e, c);
        Event managed = eventRepository.save(e);
        registerChange("references-changed");
        return managed;
    }

    @Transactional 
    public void delete(Long id) {
        Event e = eventRepository.findById(id).orElseThrow(() -> new NotFoundException("Событие не найдено"));
        eventRepository.delete(e);
        registerChange("references-changed");
    }

    private void apply(Event v, EventCommand c) {
        v.setName(c.name().trim());
        v.setMinAge(c.minAge());
        v.setDescription(c.description().trim());
    }

    private void registerChange(String msg) {
        publisher.publishEvent(new DataChangedEvent(msg));
    }
}
