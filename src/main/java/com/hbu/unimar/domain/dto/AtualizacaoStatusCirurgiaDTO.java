package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.enums.StatusCirurgia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AtualizacaoStatusCirurgiaDTO(
        @NotNull(message = "O novo status é obrigatório")
        StatusCirurgia novoStatus,

        @NotBlank(message = "O usuário responsável pela alteração é obrigatório")
        String usuarioResponsavel
) {}