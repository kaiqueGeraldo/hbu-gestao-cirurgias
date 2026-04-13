package com.hbu.unimar.domain.entity;

import com.hbu.unimar.domain.enums.StatusCirurgia;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cirurgia_historico_status")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of = "id")
public class CirurgiaHistoricoStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cirurgia_id", nullable = false)
    private Cirurgia cirurgia;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status_anterior")
    private StatusCirurgia statusAnterior;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status_novo", nullable = false)
    private StatusCirurgia statusNovo;

    @Column(name = "usuario_responsavel", nullable = false, length = 100)
    private String usuarioResponsavel;

    @Column(name = "data_hora", updatable = false)
    private LocalDateTime dataHora = LocalDateTime.now();
}