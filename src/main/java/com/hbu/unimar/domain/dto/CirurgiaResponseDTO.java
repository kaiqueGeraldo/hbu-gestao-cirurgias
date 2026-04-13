package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.entity.Cirurgia;
import com.hbu.unimar.domain.enums.Prioridade;
import com.hbu.unimar.domain.enums.StatusCirurgia;

import java.time.ZonedDateTime;
import java.util.UUID;

public record CirurgiaResponseDTO(
        UUID id,
        UUID pacienteId,
        UUID salaId,
        Prioridade prioridade,
        StatusCirurgia statusAtual,
        ZonedDateTime inicioPrevisto,
        ZonedDateTime fimPrevisto
) {
    public CirurgiaResponseDTO(Cirurgia cirurgia) {
        this(
                cirurgia.getId(),
                cirurgia.getPaciente().getId(),
                cirurgia.getSala().getId(),
                cirurgia.getPrioridade(),
                cirurgia.getStatusAtual(),
                cirurgia.getHorarioPrevisto().lower(),
                cirurgia.getHorarioPrevisto().upper()
        );
    }
}