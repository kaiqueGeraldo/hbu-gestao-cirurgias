package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.enums.PapelEquipe;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AlocacaoMembroRequestDTO(
        @NotNull UUID profissionalId,
        @NotNull PapelEquipe papel
) {}
