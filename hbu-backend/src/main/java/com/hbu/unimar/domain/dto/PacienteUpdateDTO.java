package com.hbu.unimar.domain.dto;

import org.springframework.lang.Nullable;
import java.time.LocalDate;

public record PacienteUpdateDTO(
        @Nullable String nome,
        @Nullable String cpf,
        @Nullable LocalDate dataNascimento
) {}