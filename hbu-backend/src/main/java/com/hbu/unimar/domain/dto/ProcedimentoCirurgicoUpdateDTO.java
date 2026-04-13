package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.enums.TipoSala;
import org.springframework.lang.Nullable;

public record ProcedimentoCirurgicoUpdateDTO(
        @Nullable String codigoTuss,
        @Nullable String descricao,
        @Nullable Integer tempoMedioMinutos,
        @Nullable TipoSala tipoSalaExigida
) {}