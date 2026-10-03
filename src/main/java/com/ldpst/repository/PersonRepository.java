package com.ldpst.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ldpst.model.domain.Person;

public interface PersonRepository extends JpaRepository<Person, Long> {
    public Optional<Person> findById(Long id);
}
