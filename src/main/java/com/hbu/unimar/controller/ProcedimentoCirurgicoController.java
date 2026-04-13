package com.hbu.unimar.controller;

import com.hbu.unimar.domain.dto.ProcedimentoCirurgicoRequestDTO;
import com.hbu.unimar.domain.dto.ProcedimentoCirurgicoResponseDTO;
import com.hbu.unimar.service.ProcedimentoCirurgicoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/procedimentos")
@RequiredArgsConstructor
public class ProcedimentoCirurgicoController {

    private final ProcedimentoCirurgicoService procedimentoService;

    @PostMapping
    public ResponseEntity<ProcedimentoCirurgicoResponseDTO> criar(@RequestBody @Valid ProcedimentoCirurgicoRequestDTO dto) {
        log.info("Recebida requisição HTTP POST para criar procedimento cirúrgico. Código TUSS: {}", dto.codigoTuss());
        ProcedimentoCirurgicoResponseDTO response = procedimentoService.criarProcedimento(dto);
        log.info("Procedimento cirúrgico criado com sucesso.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProcedimentoCirurgicoResponseDTO>> listar() {
        return ResponseEntity.ok(procedimentoService.listarProcedimentos());
    }
}