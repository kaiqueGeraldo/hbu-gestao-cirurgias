package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.entity.CirurgiaProcedimento;
import java.util.UUID;

public record CirurgiaProcedimentoResponseDTO(
        UUID procedimentoId,
        String codigoTuss,
        String descricao,
        Boolean isPrincipal
) {
    public CirurgiaProcedimentoResponseDTO(CirurgiaProcedimento cp) {
        this(
                cp.getProcedimento().getId(),
                cp.getProcedimento().getCodigoTuss(),
                cp.getProcedimento().getDescricao(),
                cp.getIsPrincipal()
        );
    }
}