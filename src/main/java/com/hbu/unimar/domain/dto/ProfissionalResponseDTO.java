package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.entity.Profissional;

import java.util.UUID;

public record ProfissionalResponseDTO(
        UUID id,
        String nomeCompleto,
        String crmCoren,
        String especialidade,
        Boolean ativo
) {
    public ProfissionalResponseDTO(Profissional profissional) {
        this(
                profissional.getId(),
                profissional.getNomeCompleto(),
                profissional.getCrmCoren(),
                profissional.getEspecialidade(),
                profissional.getAtivo()
        );
    }
}