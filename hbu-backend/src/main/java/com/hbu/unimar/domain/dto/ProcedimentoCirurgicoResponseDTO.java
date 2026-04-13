package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.entity.ProcedimentoCirurgico;
import com.hbu.unimar.domain.enums.TipoSala;

import java.util.UUID;

public record ProcedimentoCirurgicoResponseDTO(
        UUID id,
        String codigoTuss,
        String descricao,
        Integer tempoMedioMinutos,
        TipoSala tipoSalaExigida
) {
    public ProcedimentoCirurgicoResponseDTO(ProcedimentoCirurgico procedimento) {
        this(
                procedimento.getId(),
                procedimento.getCodigoTuss(),
                procedimento.getDescricao(),
                procedimento.getTempoMedioMinutos(),
                procedimento.getTipoSalaExigida()
        );
    }
}