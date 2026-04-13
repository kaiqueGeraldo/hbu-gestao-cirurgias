package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.entity.Usuario;
import com.hbu.unimar.domain.enums.RoleUsuario;
import java.util.UUID;

public record UsuarioResponseDTO(
        UUID id,
        String email,
        RoleUsuario role,
        UUID profissionalId,
        String nomeProfissional,
        Boolean ativo
) {
    public UsuarioResponseDTO(Usuario usuario) {
        this(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getRole(),
                usuario.getProfissional() != null ? usuario.getProfissional().getId() : null,
                usuario.getProfissional() != null ? usuario.getProfissional().getNomeCompleto() : null,
                usuario.getAtivo()
        );
    }
}