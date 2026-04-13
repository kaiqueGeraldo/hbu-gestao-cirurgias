package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.entity.CirurgiaEquipe;
import com.hbu.unimar.domain.enums.PapelEquipe;

import java.time.ZonedDateTime;
import java.util.UUID;

public record MembroEquipeResponseDTO(
        UUID idAlocacao,
        UUID profissionalId,
        String nomeProfissional,
        String crmCoren,
        PapelEquipe papel,
        Boolean isAtivo,
        ZonedDateTime alocadoEm,
        ZonedDateTime removidoEm
) {
    public MembroEquipeResponseDTO(CirurgiaEquipe equipe) {
        this(
                equipe.getId(),
                equipe.getProfissional().getId(),
                equipe.getProfissional().getNomeCompleto(),
                equipe.getProfissional().getCrmCoren(),
                equipe.getPapel(),
                equipe.getIsAtivo(),
                equipe.getAlocadoEm(),
                equipe.getRemovidoEm()
        );
    }
}
