package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.enums.TipoSala;
import org.springframework.lang.Nullable;

public record SalaCirurgicaUpdateDTO(
        @Nullable String nomeNumero,
        @Nullable TipoSala tipoSala,
        @Nullable String statusOperacional
) {}