package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.enums.TipoSala;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SalaCirurgicaRequestDTO(
        @NotBlank(message = "O nome ou número da sala é obrigatório")
        String nomeNumero,

        @NotNull(message = "O tipo da sala é obrigatório")
        TipoSala tipoSala,

        String statusOperacional
) {}