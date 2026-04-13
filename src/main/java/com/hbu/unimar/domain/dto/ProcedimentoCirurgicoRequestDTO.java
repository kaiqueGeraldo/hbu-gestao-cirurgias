package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.enums.TipoSala;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ProcedimentoCirurgicoRequestDTO(
        @NotBlank(message = "O código TUSS é obrigatório")
        String codigoTuss,

        @NotBlank(message = "A descrição é obrigatória")
        String descricao,

        @NotNull(message = "O tempo médio em minutos é obrigatório")
        @Positive(message = "O tempo médio deve ser maior que zero")
        Integer tempoMedioMinutos,

        @NotNull(message = "O tipo de sala exigida é obrigatório")
        TipoSala tipoSalaExigida
) {}