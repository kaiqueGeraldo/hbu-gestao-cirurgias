package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.entity.Cirurgia;
import com.hbu.unimar.domain.enums.Prioridade;
import com.hbu.unimar.domain.enums.StatusCirurgia;

import java.time.ZonedDateTime;
import java.util.UUID;

public record CirurgiaResponseDTO(
        UUID id,
        UUID pacienteId,
        String pacienteNome,
        String pacienteCpf,
        UUID salaId,
        String salaNomeNumero,
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
                cirurgia.getPaciente().getNome(),
                cirurgia.getPaciente().getCpf(),
                cirurgia.getSala() != null ? cirurgia.getSala().getId() : null,
                cirurgia.getSala() != null ? cirurgia.getSala().getNomeNumero() : null,
                cirurgia.getPrioridade(),
                cirurgia.getStatusAtual(),
                cirurgia.getHorarioPrevisto() != null ? cirurgia.getHorarioPrevisto().lower() : null,
                cirurgia.getHorarioPrevisto() != null ? cirurgia.getHorarioPrevisto().upper() : null,
                cirurgia.getHorarioReal() != null ? cirurgia.getHorarioReal().lower() : null,
                cirurgia.getHorarioReal() != null ? cirurgia.getHorarioReal().upper() : null
        );
    }
}