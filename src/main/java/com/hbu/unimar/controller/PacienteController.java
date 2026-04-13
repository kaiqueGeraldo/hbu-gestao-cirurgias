package com.hbu.unimar.controller;

import com.hbu.unimar.domain.dto.PacienteRequestDTO;
import com.hbu.unimar.domain.dto.PacienteResponseDTO;
import com.hbu.unimar.service.PacienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;

    @PostMapping
    public ResponseEntity<PacienteResponseDTO> criar(@RequestBody @Valid PacienteRequestDTO dto) {
        log.info("Recebida requisição para criação de novo paciente.");
        PacienteResponseDTO response = pacienteService.criarPaciente(dto);
        log.info("Paciente criado com sucesso.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PacienteResponseDTO>> listar() {
        List<PacienteResponseDTO> response = pacienteService.listarPacientes();
        return ResponseEntity.ok(response);
    }
}