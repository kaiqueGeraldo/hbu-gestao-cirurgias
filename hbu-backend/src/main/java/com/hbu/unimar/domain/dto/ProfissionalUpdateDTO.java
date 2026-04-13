package com.hbu.unimar.domain.dto;

import org.springframework.lang.Nullable;

public record ProfissionalUpdateDTO(
        @Nullable String nomeCompleto,
        @Nullable String crmCoren,
        @Nullable String especialidade
) {}