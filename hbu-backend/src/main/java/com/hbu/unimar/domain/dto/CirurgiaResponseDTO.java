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
        ZonedDateTime fimPrevisto,
        ZonedDateTime inicioReal,
        ZonedDateTime fimReal
) {
    public CirurgiaResponseDTO(Cirurgia cirurgia) {
        this(
                cirurgia.getId(),
                cirurgia.getPaciente().getId(),
                cirurgia.getSala() != null ? cirurgia.getSala().getId() : null,
                cirurgia.getPrioridade(),
                cirurgia.getStatusAtual(),
                cirurgia.getHorarioPrevisto().lower(),
                cirurgia.getHorarioPrevisto().upper(),
                cirurgia.getHorarioReal() != null ? cirurgia.getHorarioReal().lower() : null,
                cirurgia.getHorarioReal() != null ? cirurgia.getHorarioReal().upper() : null
        );
    }
}