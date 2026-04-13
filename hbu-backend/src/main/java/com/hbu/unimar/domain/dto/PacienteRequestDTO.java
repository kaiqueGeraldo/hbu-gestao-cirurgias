package com.hbu.unimar.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.br.CPF;

import java.time.LocalDate;

public record PacienteRequestDTO(
        @NotBlank(message = "O nome é obrigatório")
        String nome,

        @NotBlank(message = "O CPF é obrigatório")
        @CPF(message = "CPF em formato inválido")
        String cpf,

        @NotNull(message = "A data de nascimento é obrigatória")
        LocalDate dataNascimento
) {}