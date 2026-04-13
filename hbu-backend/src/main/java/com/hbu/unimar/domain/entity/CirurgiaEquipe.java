package com.hbu.unimar.domain.entity;

import com.hbu.unimar.domain.enums.PapelEquipe;
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
@Table(name = "cirurgia_equipe")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of = "id")
public class CirurgiaEquipe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cirurgia_id", nullable = false)
    private Cirurgia cirurgia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profissional_id", nullable = false)
    private Profissional profissional;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "papel", nullable = false)
    private PapelEquipe papel;

    @Column(name = "is_ativo", nullable = false)
    private Boolean isAtivo = true;

    @Type(PostgreSQLRangeType.class)
    @Column(name = "horario_alocacao", columnDefinition = "tstzrange", nullable = false)
    private Range<ZonedDateTime> horarioAlocacao;

    @Column(name = "alocado_em", nullable = false, updatable = false)
    private ZonedDateTime alocadoEm = ZonedDateTime.now();

    @Column(name = "removido_em")
    private ZonedDateTime removidoEm;

    @Column(name = "motivo_remocao")
    private String motivoRemocao;

    @Column(name = "usuario_responsavel_alocacao", nullable = false)
    private String usuarioResponsavelAlocacao;
}