package com.ldpst.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.ldpst.model.domain.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Integer>, JpaSpecificationExecutor<Ticket> {
    // public Page<Ticket> findAll(Pageable pageable);
    // public Page<Ticket> findAll(Pageable pageable, Sort sort);
    // public Page<Ticket> findAll(Pageable pageable, Sort sort, Specification<Ticket> spec);
}