package com.hbu.unimar.controller;

import com.hbu.unimar.domain.dto.UsuarioRequestDTO;
import com.hbu.unimar.domain.dto.UsuarioResponseDTO;
import com.hbu.unimar.domain.dto.UsuarioUpdateDTO;
import com.hbu.unimar.service.UsuarioService;
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
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> criar(@RequestBody @Valid UsuarioRequestDTO dto) {
        UsuarioResponseDTO response = usuarioService.criarUsuario(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioResponseDTO>> listarAtivos() {
        return ResponseEntity.ok(usuarioService.listarUsuariosAtivos());
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> atualizar(
            @PathVariable UUID id,
            @RequestBody UsuarioUpdateDTO dto) {
        UsuarioResponseDTO response = usuarioService.atualizarUsuario(id, dto);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> inativar(@PathVariable UUID id) {
        usuarioService.inativarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}