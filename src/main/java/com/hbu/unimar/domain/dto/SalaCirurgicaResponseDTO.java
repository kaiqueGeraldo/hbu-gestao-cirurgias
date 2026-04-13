package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.entity.SalaCirurgica;
import com.hbu.unimar.domain.enums.TipoSala;

import java.util.UUID;

public record SalaCirurgicaResponseDTO(
        UUID id,
        String nomeNumero,
        TipoSala tipoSala,
        String statusOperacional
) {
    public SalaCirurgicaResponseDTO(SalaCirurgica sala) {
        this(sala.getId(), sala.getNomeNumero(), sala.getTipoSala(), sala.getStatusOperacional());
    }
}