package com.hbu.unimar.domain.dto;

import jakarta.validation.constraints.NotBlank;

public record ProfissionalRequestDTO(
        @NotBlank(message = "O nome completo é obrigatório")
        String nomeCompleto,

        @NotBlank(message = "O CRM ou COREN é obrigatório")
        String crmCoren,

        String especialidade
) {}