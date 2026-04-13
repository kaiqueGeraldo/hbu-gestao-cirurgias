package com.hbu.unimar.domain.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import java.time.ZonedDateTime;

public record EncerramentoCirurgiaDTO(
        @NotNull(message = "O início real da cirurgia é obrigatório")
        @PastOrPresent(message = "O início real não pode estar no futuro")
        ZonedDateTime inicioReal,

        @NotNull(message = "O fim real da cirurgia é obrigatório")
        @PastOrPresent(message = "O fim real não pode estar no futuro")
        ZonedDateTime fimReal
) {}