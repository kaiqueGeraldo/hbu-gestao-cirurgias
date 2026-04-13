package com.hbu.unimar.domain.entity;

import com.hbu.unimar.domain.enums.Prioridade;
import com.hbu.unimar.domain.enums.StatusCirurgia;
import io.hypersistence.utils.hibernate.type.range.PostgreSQLRangeType;
import io.hypersistence.utils.hibernate.type.range.Range;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "cirurgia")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of = "id")
public class Cirurgia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sala_id")
    private SalaCirurgica sala;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "prioridade", nullable = false)
    private Prioridade prioridade;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status_atual", nullable = false)
    private StatusCirurgia statusAtual;

    @Type(PostgreSQLRangeType.class)
    @Column(name = "horario_previsto", columnDefinition = "tstzrange")
    private Range<ZonedDateTime> horarioPrevisto;

    @Version
    private Integer versao;
}