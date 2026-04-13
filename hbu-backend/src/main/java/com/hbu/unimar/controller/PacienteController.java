package com.hbu.unimar.controller;

import com.hbu.unimar.domain.dto.PacienteRequestDTO;
import com.hbu.unimar.domain.dto.PacienteResponseDTO;
import com.hbu.unimar.domain.dto.PacienteUpdateDTO;
import com.hbu.unimar.service.PacienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;

    @PostMapping
    @PreAuthorize("hasAnyRole('RECEPCAO', 'GESTOR_CC', 'ADMIN')")
    public ResponseEntity<PacienteResponseDTO> criar(@RequestBody @Valid PacienteRequestDTO dto) {
        log.info("Recebida requisição para criação de novo paciente.");
        PacienteResponseDTO response = pacienteService.criarPaciente(dto);
        log.info("Paciente criado com sucesso.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PacienteResponseDTO>> listarAtivos() {
        List<PacienteResponseDTO> response = pacienteService.listarPacientesAtivos();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PacienteResponseDTO>> listarTodos() {
        List<PacienteResponseDTO> response = pacienteService.listarTodosPacientes();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPCAO', 'GESTOR_CC', 'ADMIN')")
    public ResponseEntity<PacienteResponseDTO> atualizar(
            @PathVariable UUID id,
            @RequestBody PacienteUpdateDTO dto) {

        PacienteResponseDTO response = pacienteService.atualizarPaciente(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GESTOR_CC', 'ADMIN')")
    public ResponseEntity<Void> inativar(@PathVariable UUID id) {
        pacienteService.inativarPaciente(id);
        return ResponseEntity.noContent().build();
    }
}