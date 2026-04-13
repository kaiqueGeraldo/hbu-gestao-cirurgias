package com.hbu.unimar.controller;

import com.hbu.unimar.domain.dto.ProcedimentoCirurgicoRequestDTO;
import com.hbu.unimar.domain.dto.ProcedimentoCirurgicoResponseDTO;
import com.hbu.unimar.domain.dto.ProcedimentoCirurgicoUpdateDTO;
import com.hbu.unimar.service.ProcedimentoCirurgicoService;
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
@RequestMapping("/api/procedimentos")
@RequiredArgsConstructor
public class ProcedimentoCirurgicoController {

    private final ProcedimentoCirurgicoService procedimentoService;

    @PostMapping
    @PreAuthorize("hasAnyRole('GESTOR_CC', 'ADMIN')")
    public ResponseEntity<ProcedimentoCirurgicoResponseDTO> criar(@RequestBody @Valid ProcedimentoCirurgicoRequestDTO dto) {
        log.info("Recebida requisição HTTP POST para criar procedimento cirúrgico. Código TUSS: {}", dto.codigoTuss());
        ProcedimentoCirurgicoResponseDTO response = procedimentoService.criarProcedimento(dto);
        log.info("Procedimento cirúrgico criado com sucesso.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProcedimentoCirurgicoResponseDTO>> listarAtivos() {
        return ResponseEntity.ok(procedimentoService.listarProcedimentosAtivos());
    }

    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProcedimentoCirurgicoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(procedimentoService.listarTodosProcedimentos());
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('GESTOR_CC', 'ADMIN')")
    public ResponseEntity<ProcedimentoCirurgicoResponseDTO> atualizar(
            @PathVariable UUID id,
            @RequestBody ProcedimentoCirurgicoUpdateDTO dto) {

        ProcedimentoCirurgicoResponseDTO response = procedimentoService.atualizarProcedimento(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GESTOR_CC', 'ADMIN')")
    public ResponseEntity<Void> inativar(@PathVariable UUID id) {
        procedimentoService.inativarProcedimento(id);
        return ResponseEntity.noContent().build();
    }
}