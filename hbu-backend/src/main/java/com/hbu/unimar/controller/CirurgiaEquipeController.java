package com.hbu.unimar.controller;

import com.hbu.unimar.domain.dto.AlocacaoMembroRequestDTO;
import com.hbu.unimar.domain.dto.MembroEquipeResponseDTO;
import com.hbu.unimar.domain.dto.SubstituicaoMembroRequestDTO;
import com.hbu.unimar.service.CirurgiaEquipeService;
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
@RequiredArgsConstructor
public class CirurgiaEquipeController {

    private final CirurgiaEquipeService equipeService;

    @PostMapping("/api/cirurgias/{cirurgiaId}/equipe")
    @PreAuthorize("hasAnyRole('GESTOR_CC', 'ADMIN')")
    public ResponseEntity<MembroEquipeResponseDTO> alocarMembro(
            @PathVariable UUID cirurgiaId,
            @RequestBody @Valid AlocacaoMembroRequestDTO dto) {

        log.info("Recebida requisição HTTP POST para alocar membro na cirurgia: {}", cirurgiaId);
        MembroEquipeResponseDTO response = equipeService.alocarMembro(cirurgiaId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/api/equipe-cirurgica/{alocacaoId}/substituir")
    @PreAuthorize("hasAnyRole('GESTOR_CC', 'ADMIN')")
    public ResponseEntity<MembroEquipeResponseDTO> substituirMembro(
            @PathVariable UUID alocacaoId,
            @RequestBody @Valid SubstituicaoMembroRequestDTO dto) {

        log.info("Recebida requisição HTTP PATCH para substituir membro na alocação: {}", alocacaoId);
        MembroEquipeResponseDTO response = equipeService.substituirMembro(alocacaoId, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/cirurgias/{cirurgiaId}/equipe")
    @PreAuthorize("hasAnyRole('GESTOR_CC', 'MEDICO', 'ADMIN')")
    public ResponseEntity<List<MembroEquipeResponseDTO>> listarEquipeDaCirurgia(@PathVariable UUID cirurgiaId) {
        log.info("Requisição HTTP GET para listar equipe da cirurgia: {}", cirurgiaId);
        List<MembroEquipeResponseDTO> equipe = equipeService.listarEquipeAtiva(cirurgiaId);
        return ResponseEntity.ok(equipe);
    }
}