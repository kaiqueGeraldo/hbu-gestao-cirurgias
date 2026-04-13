package com.hbu.unimar.controller;

import com.hbu.unimar.domain.dto.ProfissionalRequestDTO;
import com.hbu.unimar.domain.dto.ProfissionalResponseDTO;
import com.hbu.unimar.service.ProfissionalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/profissionais")
@RequiredArgsConstructor
public class ProfissionalController {

    private final ProfissionalService profissionalService;

    @PostMapping
    public ResponseEntity<ProfissionalResponseDTO> criar(@RequestBody @Valid ProfissionalRequestDTO dto) {
        log.info("Recebida requisição para criação de novo profissional. CRM/Coren: {}", dto.crmCoren());
        ProfissionalResponseDTO response = profissionalService.criarProfissional(dto);
        log.info("Profissional criado com sucesso.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProfissionalResponseDTO>> listar() {
        return ResponseEntity.ok(profissionalService.listarProfissionais());
    }
}