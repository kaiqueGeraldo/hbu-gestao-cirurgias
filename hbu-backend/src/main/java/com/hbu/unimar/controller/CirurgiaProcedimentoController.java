package com.hbu.unimar.controller;

import com.hbu.unimar.domain.dto.CirurgiaProcedimentoResponseDTO;
import com.hbu.unimar.domain.dto.SincronizacaoProcedimentosDTO;
import com.hbu.unimar.service.CirurgiaProcedimentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/cirurgias")
@RequiredArgsConstructor
public class CirurgiaProcedimentoController {

    private final CirurgiaProcedimentoService cirurgiaProcedimentoService;

    @PutMapping("/{cirurgiaId}/procedimentos")
    @PreAuthorize("hasAnyRole('MEDICO', 'GESTOR_CC', 'ADMIN')")
    public ResponseEntity<List<CirurgiaProcedimentoResponseDTO>> sincronizarProcedimentos(
            @PathVariable UUID cirurgiaId,
            @RequestBody @Valid SincronizacaoProcedimentosDTO dto) {

        log.info("Recebida requisição HTTP PUT para sincronizar procedimentos da cirurgia: {}", cirurgiaId);
        List<CirurgiaProcedimentoResponseDTO> response = cirurgiaProcedimentoService.sincronizarProcedimentos(cirurgiaId, dto);
        return ResponseEntity.ok(response);
    }
}