package com.hbu.unimar.controller;

import com.hbu.unimar.domain.dto.SalaCirurgicaRequestDTO;
import com.hbu.unimar.domain.dto.SalaCirurgicaResponseDTO;
import com.hbu.unimar.domain.dto.SalaCirurgicaUpdateDTO;
import com.hbu.unimar.service.SalaCirurgicaService;
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
@RequestMapping("/api/salas")
@RequiredArgsConstructor
public class SalaCirurgicaController {

    private final SalaCirurgicaService salaService;

    @PostMapping
    @PreAuthorize("hasAnyRole('GESTOR_CC', 'ADMIN')")
    public ResponseEntity<SalaCirurgicaResponseDTO> criar(@RequestBody @Valid SalaCirurgicaRequestDTO dto) {
        log.info("Recebida requisição para criação de sala cirúrgica. Nome/Número: {}", dto.nomeNumero());
        SalaCirurgicaResponseDTO response = salaService.criarSala(dto);
        log.info("Sala cirúrgica criada com sucesso.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SalaCirurgicaResponseDTO>> listarAtivas() {
        return ResponseEntity.ok(salaService.listarSalasAtivas());
    }

    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SalaCirurgicaResponseDTO>> listarTodas() {
        return ResponseEntity.ok(salaService.listarTodasSalas());
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('GESTOR_CC', 'ADMIN')")
    public ResponseEntity<SalaCirurgicaResponseDTO> atualizar(
            @PathVariable UUID id,
            @RequestBody SalaCirurgicaUpdateDTO dto) {

        SalaCirurgicaResponseDTO response = salaService.atualizarSala(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('GESTOR_CC', 'ADMIN')")
    public ResponseEntity<Void> inativar(@PathVariable UUID id) {
        salaService.inativarSala(id);
        return ResponseEntity.noContent().build();
    }
}