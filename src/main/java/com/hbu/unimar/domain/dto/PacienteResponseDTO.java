package com.hbu.unimar.domain.dto;

import com.hbu.unimar.domain.entity.Paciente;

import java.time.LocalDate;
import java.util.UUID;

public record PacienteResponseDTO(
        UUID id,
        String nome,
        String cpf,
        LocalDate dataNascimento
) {
    public PacienteResponseDTO(Paciente paciente) {
        this(paciente.getId(), paciente.getNome(), paciente.getCpf(), paciente.getDataNascimento());
    }
}