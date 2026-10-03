package com.ldpst.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.ldpst.controller.api.ApiMapper;
import com.ldpst.controller.api.ApiModel.EventDto;
import com.ldpst.controller.api.ApiModel.PersonDto;
import com.ldpst.controller.api.ApiModel.VenueDto;
import com.ldpst.model.domain.Event;
import com.ldpst.model.domain.Person;
import com.ldpst.model.domain.Venue;
import com.ldpst.model.dto.Command.EventCommand;
import com.ldpst.model.dto.Command.PersonCommand;
import com.ldpst.model.dto.Command.VenueCommand;
import com.ldpst.service.EventService;
import com.ldpst.service.PersonService;
import com.ldpst.service.VenueService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController 
@RequestMapping ("/api/references")
public class ReferenceController {
    private final PersonService personService;
    private final EventService eventService;
    private final VenueService venueService;
    private final ApiMapper mapper;

    public ReferenceController(PersonService personService, EventService eventService, VenueService venueService, ApiMapper mapper) {
        this.personService = personService;
        this.eventService = eventService;
        this.venueService = venueService;
        this.mapper = mapper;
    }

    @GetMapping("/persons")
    public List<PersonDto> people() {
        return personService.people().stream().map(mapper::person).toList();
    }

    @PostMapping("/persons")
    @ResponseStatus(HttpStatus.CREATED)
    public PersonDto addPerson(@Valid @RequestBody PersonDto body) {
        PersonCommand command = mapper.command(body);
        Person person = personService.save(null, command);
        PersonDto personDto = mapper.person(person);
        return personDto;
    }

    @PutMapping("/persons/{id}")
    public PersonDto putPerson(@PathVariable long id, @Valid @RequestBody PersonDto body) {
        PersonCommand command = mapper.command(body);
        Person person = personService.save(id, command);
        PersonDto personDto = mapper.person(person);
        return personDto;
    }

    @DeleteMapping("/persons/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePerson(@PathVariable long id) {
        personService.delete(id);
    }

    @GetMapping("/events")
    public List<EventDto> events() {
        return eventService.events().stream().map(mapper::event).toList();
    }

    @PostMapping("/events")
    @ResponseStatus(HttpStatus.CREATED)
    public EventDto addPerson(@Valid @RequestBody EventDto body) {
        EventCommand command = mapper.command(body);
        Event event = eventService.save(null, command);
        EventDto eventDto = mapper.event(event);
        return eventDto;
    }

    @PutMapping("/events/{id}")
    public EventDto putEvent(@PathVariable long id, @Valid @RequestBody EventDto body) {
        EventCommand command = mapper.command(body);
        Event event = eventService.save(id, command);
        EventDto eventDto = mapper.event(event);
        return eventDto;
    }

    @DeleteMapping("/events/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(@PathVariable long id) {
        eventService.delete(id);
    }

    @GetMapping("/venues")
    public List<VenueDto> venues() {
        return venueService.venues().stream().map(mapper::venue).toList();
    }

    @PostMapping("/venues")
    @ResponseStatus(HttpStatus.CREATED)
    public VenueDto addPerson(@Valid @RequestBody VenueDto body) {
        VenueCommand command = mapper.command(body);
        Venue venue = venueService.save(null, command);
        VenueDto venueDto = mapper.venue(venue);
        return venueDto;
    }

    @PutMapping("/venues/{id}")
    public VenueDto putEvent(@PathVariable long id, @Valid @RequestBody VenueDto body) {
        VenueCommand command = mapper.command(body);
        Venue venue = venueService.save(id, command);
        VenueDto venueDto = mapper.venue(venue);
        return venueDto;
    }

    @DeleteMapping("/venues/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVenue(@PathVariable long id) {
        venueService.delete(id);
    }
}
