package com.hbu.unimar.domain.entity;

import com.hbu.unimar.domain.entity.pk.CirurgiaProcedimentoId;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cirurgia_procedimento")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of = "id")
public class CirurgiaProcedimento {

    @EmbeddedId
    private CirurgiaProcedimentoId id = new CirurgiaProcedimentoId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("cirurgiaId")
    @JoinColumn(name = "cirurgia_id", insertable = false, updatable = false)
    private Cirurgia cirurgia;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("procedimentoId")
    @JoinColumn(name = "procedimento_id", insertable = false, updatable = false)
    private ProcedimentoCirurgico procedimento;

    @Column(name = "is_principal", nullable = false)
    private Boolean isPrincipal = false;
}