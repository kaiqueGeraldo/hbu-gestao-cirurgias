package com.hbu.unimar.controller;

import com.hbu.unimar.domain.dto.AgendamentoCirurgiaDTO;
import com.hbu.unimar.domain.dto.AtualizacaoStatusCirurgiaDTO;
import com.hbu.unimar.domain.dto.CirurgiaResponseDTO;
import com.hbu.unimar.service.CirurgiaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/cirurgias")
@RequiredArgsConstructor
public class CirurgiaController {

    private final CirurgiaService cirurgiaService;

    @PostMapping("/agendar")
    public ResponseEntity<CirurgiaResponseDTO> agendarCirurgia(@RequestBody @Valid AgendamentoCirurgiaDTO dto) {
        log.info("Recebida requisição para agendar cirurgia. Sala ID: {}, Paciente ID: {}", dto.salaId(), dto.pacienteId());
        CirurgiaResponseDTO agendamento = cirurgiaService.agendarCirurgia(dto);
        log.info("Cirurgia agendada com sucesso.");
        return ResponseEntity.status(HttpStatus.CREATED).body(agendamento);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CirurgiaResponseDTO> atualizarStatus(
            @PathVariable UUID id,
            @RequestBody @Valid AtualizacaoStatusCirurgiaDTO dto) {

        log.info("Requisição HTTP PATCH recebida para atualizar status da cirurgia ID: {}", id);
        CirurgiaResponseDTO response = cirurgiaService.atualizarStatus(id, dto);
        return ResponseEntity.ok(response);
    }
}