package com.hbu.unimar.domain.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AlocacaoProcedimentoRequestDTO(
        @NotNull(message = "O ID do procedimento é obrigatório")
        UUID procedimentoId,

        @NotNull(message = "A indicação se é o procedimento principal é obrigatória")
        Boolean isPrincipal
) {}