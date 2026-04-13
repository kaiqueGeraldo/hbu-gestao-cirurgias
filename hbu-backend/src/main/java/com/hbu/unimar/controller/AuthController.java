package com.hbu.unimar.controller;

import com.hbu.unimar.domain.entity.Usuario;
import com.hbu.unimar.infra.security.JwtTokenService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;

    public record LoginRequestDTO(
            @NotBlank(message = "O email é obrigatório") String email,
            @NotBlank(message = "A senha é obrigatória") String senha
    ) {}

    public record TokenResponseDTO(String accessToken) {}

    @PostMapping("/login")
    public ResponseEntity<TokenResponseDTO> efetuarLogin(@RequestBody @Valid LoginRequestDTO dto) {
        log.info("Tentativa de login recebida para o utilizador: {}", dto.email());

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(dto.email(), dto.senha());
        Authentication authRealizado = authenticationManager.authenticate(authToken);
        Usuario usuarioAutenticado = (Usuario) authRealizado.getPrincipal();
        String token = jwtTokenService.gerarToken(
                usuarioAutenticado != null ? usuarioAutenticado.getEmail() : null,
                usuarioAutenticado != null ? usuarioAutenticado.getRole().name() : null
        );

        log.info("Login efetuado com sucesso. Papel: {}", usuarioAutenticado != null ? usuarioAutenticado.getRole() : null);

        return ResponseEntity.ok(new TokenResponseDTO(token));
    }
}