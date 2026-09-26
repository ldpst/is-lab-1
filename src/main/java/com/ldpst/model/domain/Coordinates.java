package com.ldpst.model.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;

@Embeddable
public class Coordinates {
    @Column(name = "coordinate_x", nullable = false)
    private long x;

    @NotNull
    @Column(name = "coordinate_y", nullable = false)
    private Long y;

    public long getX() {
        return x;
    }

    public void setX(long x) {
        this.x = x;
    }

    public Long getY() {
        return y;
    }

    public void setY(Long y) {
        this.y = y;
    }
}
