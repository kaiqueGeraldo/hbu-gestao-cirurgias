package com.hbu.unimar.domain.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.UUID;

public record ReagendamentoCirurgiaDTO(
        @NotNull(message = "A nova sala é obrigatória.")
        UUID salaId,

        @NotNull(message = "O novo horário de início é obrigatório.")
        @FutureOrPresent(message = "O reagendamento não pode ser no passado.")
        ZonedDateTime inicioPrevisto,

        @NotNull(message = "O novo horário de fim é obrigatório.")
        @FutureOrPresent(message = "O reagendamento não pode ser no passado.")
        ZonedDateTime fimPrevisto
) {}