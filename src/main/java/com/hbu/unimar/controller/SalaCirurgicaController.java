package com.hbu.unimar.controller;

import com.hbu.unimar.domain.dto.SalaCirurgicaRequestDTO;
import com.hbu.unimar.domain.dto.SalaCirurgicaResponseDTO;
import com.hbu.unimar.service.SalaCirurgicaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/salas")
@RequiredArgsConstructor
public class SalaCirurgicaController {

    private final SalaCirurgicaService salaService;

    @PostMapping
    public ResponseEntity<SalaCirurgicaResponseDTO> criar(@RequestBody @Valid SalaCirurgicaRequestDTO dto) {
        log.info("Recebida requisição para criação de sala cirúrgica. Nome/Número: {}", dto.nomeNumero());
        SalaCirurgicaResponseDTO response = salaService.criarSala(dto);
        log.info("Sala cirúrgica criada com sucesso.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<SalaCirurgicaResponseDTO>> listar() {
        return ResponseEntity.ok(salaService.listarSalas());
    }
}