package com.globaline.logistic.api.globalie_logistic_api.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

@Entity
@Data
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String nombre;

    @Column(name = "creado_en", updatable = false)
    private Timestamp creadoEn;

    @PrePersist
    protected void onCreate() {
        creadoEn = new Timestamp(System.currentTimeMillis());
    }
}