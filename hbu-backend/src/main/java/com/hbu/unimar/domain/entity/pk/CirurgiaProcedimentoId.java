package com.hbu.unimar.domain.entity.pk;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class CirurgiaProcedimentoId implements Serializable {

    @Column(name = "cirurgia_id")
    private UUID cirurgiaId;

    @Column(name = "procedimento_id")
    private UUID procedimentoId;
}