package com.ldpst.model.domain;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "venues")
public class Venue {
    @Id
    @Positive
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Positive
    @Column(nullable = false)
    private int capacity;

    @Valid
    @NotNull
    @Embedded
    private Address address;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.REMOVE)
    private List<Ticket> tickets = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String v) {
        name = v;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int v) {
        capacity = v;
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address v) {
        address = v;
    }
}
