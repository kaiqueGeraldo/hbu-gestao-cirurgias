package com.hbu.unimar.controller;

import com.hbu.unimar.domain.dto.*;
import com.hbu.unimar.service.CirurgiaService;
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
@RequestMapping("/api/cirurgias")
@RequiredArgsConstructor
public class CirurgiaController {

    private final CirurgiaService cirurgiaService;

    @PostMapping("/agendar")
    @PreAuthorize("hasAnyRole('RECEPCAO', 'GESTOR_CC', 'ADMIN')")
    public ResponseEntity<CirurgiaResponseDTO> agendarCirurgia(@RequestBody @Valid AgendamentoCirurgiaDTO dto) {
        log.info("Recebida requisição para agendar cirurgia. Sala ID: {}, Paciente ID: {}", dto.salaId(), dto.pacienteId());
        CirurgiaResponseDTO agendamento = cirurgiaService.agendarCirurgia(dto);
        log.info("Cirurgia agendada com sucesso.");
        return ResponseEntity.status(HttpStatus.CREATED).body(agendamento);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MEDICO', 'GESTOR_CC', 'ADMIN')")
    public ResponseEntity<CirurgiaResponseDTO> atualizarStatus(
            @PathVariable UUID id,
            @RequestBody @Valid AtualizacaoStatusCirurgiaDTO dto) {

        log.info("Requisição HTTP PATCH recebida para atualizar status da cirurgia ID: {}", id);
        CirurgiaResponseDTO response = cirurgiaService.atualizarStatus(id, dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/finalizar")
    @PreAuthorize("hasAnyRole('MEDICO', 'ADMIN')")
    public ResponseEntity<CirurgiaResponseDTO> finalizarCirurgia(
            @PathVariable UUID id,
            @RequestBody @Valid EncerramentoCirurgiaDTO dto) {

        log.info("Requisição HTTP POST recebida para finalizar a cirurgia ID: {}", id);
        CirurgiaResponseDTO response = cirurgiaService.finalizarCirurgia(id, dto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/cancelar")
    @PreAuthorize("hasAnyRole('GESTOR_CC', 'ADMIN')")
    public ResponseEntity<CirurgiaResponseDTO> cancelarCirurgia(
            @PathVariable UUID id,
            @RequestBody @Valid CancelamentoCirurgiaDTO dto) {

        log.info("Requisição HTTP POST recebida para cancelar cirurgia ID: {}", id);
        CirurgiaResponseDTO response = cirurgiaService.cancelarCirurgia(id, dto);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/reagendar")
    @PreAuthorize("hasAnyRole('GESTOR_CC', 'ADMIN')")
    public ResponseEntity<CirurgiaResponseDTO> reagendarCirurgia(
            @PathVariable UUID id,
            @RequestBody @Valid ReagendamentoCirurgiaDTO dto) {

        log.info("Requisição HTTP PATCH recebida para reagendar cirurgia ID: {}", id);
        CirurgiaResponseDTO response = cirurgiaService.reagendarCirurgia(id, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECEPCAO', 'MEDICO', 'GESTOR_CC', 'ADMIN')")
    public ResponseEntity<CirurgiaResponseDTO> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(cirurgiaService.buscarPorId(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPCAO', 'MEDICO', 'GESTOR_CC', 'ADMIN')")
    public ResponseEntity<List<CirurgiaResponseDTO>> listarTodas() {
        log.info("Requisição HTTP GET para listar todas as cirurgias.");
        return ResponseEntity.ok(cirurgiaService.listarTodas());
    }
}