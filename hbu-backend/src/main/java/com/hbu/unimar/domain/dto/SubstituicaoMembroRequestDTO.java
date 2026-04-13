package com.hbu.unimar.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SubstituicaoMembroRequestDTO(
        @NotNull UUID membroAtualId,
        @NotNull UUID novoProfissionalId,
        @NotBlank String motivoRemocao
) {}
