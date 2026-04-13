package com.hbu.unimar.controller;

import com.hbu.unimar.domain.dto.ProfissionalRequestDTO;
import com.hbu.unimar.domain.dto.ProfissionalResponseDTO;
import com.hbu.unimar.domain.dto.ProfissionalUpdateDTO;
import com.hbu.unimar.service.ProfissionalService;
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
@RequestMapping("/api/profissionais")
@RequiredArgsConstructor
public class ProfissionalController {

    private final ProfissionalService profissionalService;

    @PostMapping
    @PreAuthorize("hasAnyRole('GESTOR_CC', 'ADMIN')")
    public ResponseEntity<ProfissionalResponseDTO> criar(@RequestBody @Valid ProfissionalRequestDTO dto) {
        log.info("Recebida requisição para criação de novo profissional. CRM/Coren: {}", dto.crmCoren());
        ProfissionalResponseDTO response = profissionalService.criarProfissional(dto);
        log.info("Profissional criado com sucesso.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProfissionalResponseDTO>> listarAtivos() {
        return ResponseEntity.ok(profissionalService.listarProfissionaisAtivos());
    }

    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProfissionalResponseDTO>> listarTodos() {
        return ResponseEntity.ok(profissionalService.listarProfissionaisAtivos());
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('GESTOR_CC', 'ADMIN')")
    public ResponseEntity<ProfissionalResponseDTO> atualizar(
            @PathVariable UUID id,
            @RequestBody ProfissionalUpdateDTO dto) {

        log.info("Recebida requisição para atualizar de profissional. Id: {}", dto.crmCoren());
        ProfissionalResponseDTO response = profissionalService.atualizarProfissional(id, dto);
        log.info("Profissional atualizado com sucesso.");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GESTOR_CC', 'ADMIN')")
    public ResponseEntity<Void> inativar(@PathVariable UUID id) {
        log.info("Recebida requisição para inativação de profissional. Id: {}", id);
        profissionalService.inativarProfissional(id);
        log.info("Profissional inativado com sucesso.");
        return ResponseEntity.noContent().build();
    }
}