package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.enums.RoleUsuario;
import org.springframework.lang.Nullable;
import java.util.UUID;

public record UsuarioUpdateDTO(
        @Nullable String email,
        @Nullable String senha,
        @Nullable RoleUsuario role,
        @Nullable UUID profissionalId
) {}