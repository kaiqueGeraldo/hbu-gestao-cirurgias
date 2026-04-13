package com.hbu.unimar.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelamentoCirurgiaDTO(
        @NotBlank(message = "O motivo do cancelamento é obrigatório para fins de auditoria.")
        @Size(min = 10, message = "Forneça um motivo detalhado para o cancelamento.")
        String motivoCancelamento
) {}