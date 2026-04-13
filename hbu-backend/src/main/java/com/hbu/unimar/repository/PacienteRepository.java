package com.hbu.unimar.repository;

import com.hbu.unimar.domain.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PacienteRepository extends JpaRepository<Paciente, UUID> {
    List<Paciente> findByAtivoTrue();
    Optional<Paciente> findByCpf(String cpf);
}