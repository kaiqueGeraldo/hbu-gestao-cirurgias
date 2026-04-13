package com.hbu.unimar.domain.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SincronizacaoProcedimentosDTO(
        @NotEmpty(message = "A lista de procedimentos não pode estar vazia")
        @Valid List<AlocacaoProcedimentoRequestDTO> procedimentos
) {}