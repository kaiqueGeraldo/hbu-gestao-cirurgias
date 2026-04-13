package com.hbu.unimar.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "profissional")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of = "id")
public class Profissional {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nome_completo", nullable = false, length = 150)
    private String nomeCompleto;

    @Column(name = "crm_coren", nullable = false, unique = true, length = 50)
    private String crmCoren;

    @Column(length = 100)
    private String especialidade;

    @Column(nullable = false)
    private Boolean ativo = true;
}