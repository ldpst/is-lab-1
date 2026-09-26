package com.ldpst.model.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Embeddable
public class Location {
    @NotNull
    @Column(name = "location_x", nullable = false)
    private Double x;

    @NotNull
    @Column(name = "location_y", nullable = false)
    private Float y;

    @NotBlank
    @Size(max = 32)
    @Column(name = "location_name", nullable = false)
    private String name;


    public Double getX() {
        return x;
    }

    public void setX(Double x) {
        this.x = x;
    }

    public Float getY() {
        return y;
    }

    public void setY(Float y) {
        this.y = y;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
