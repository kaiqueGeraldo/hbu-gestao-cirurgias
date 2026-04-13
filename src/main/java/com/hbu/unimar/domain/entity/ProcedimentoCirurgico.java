package com.hbu.unimar.domain.entity;

import com.hbu.unimar.domain.enums.TipoSala;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "procedimento_cirurgico")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of = "id")
public class ProcedimentoCirurgico {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "codigo_tuss", nullable = false, unique = true, length = 20)
    private String codigoTuss;

    @Column(nullable = false, length = 255)
    private String descricao;

    @Column(name = "tempo_medio_minutos", nullable = false)
    private Integer tempoMedioMinutos;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "tipo_sala_exigida", nullable = false)
    private TipoSala tipoSalaExigida;
}