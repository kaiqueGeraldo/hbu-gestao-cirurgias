package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.enums.Prioridade;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

import java.time.ZonedDateTime;
import java.util.UUID;

public record AgendamentoCirurgiaDTO(
        @NotNull(message = "O ID do paciente é obrigatório")
        UUID pacienteId,

        @NotNull(message = "O ID da sala é obrigatório")
        UUID salaId,

        @NotNull(message = "A prioridade é obrigatória")
        Prioridade prioridade,

        @NotNull(message = "O início previsto é obrigatório")
        @FutureOrPresent(message = "O agendamento não pode ser no passado")
        ZonedDateTime inicioPrevisto,

        @NotNull(message = "O fim previsto é obrigatório")
        @FutureOrPresent(message = "O fim do agendamento não pode ser no passado")
        ZonedDateTime fimPrevisto
) {}