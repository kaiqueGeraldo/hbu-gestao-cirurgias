package com.hbu.unimar.service;

import com.hbu.unimar.domain.dto.*;
import com.hbu.unimar.domain.entity.Profissional;
import com.hbu.unimar.domain.entity.Usuario;
import com.hbu.unimar.infra.security.SecurityContextService;
import com.hbu.unimar.repository.ProfissionalRepository;
import com.hbu.unimar.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final ProfissionalRepository profissionalRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityContextService securityContext;

    @Transactional
    public UsuarioResponseDTO criarUsuario(UsuarioRequestDTO dto) {
        log.info("Iniciando criação de usuário para o email: {}", dto.email());

        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Já existe um usuário com este e-mail.");
        }

        Usuario usuario = new Usuario();
        usuario.setEmail(dto.email());
        usuario.setSenha(passwordEncoder.encode(dto.senha()));
        usuario.setRole(dto.role());
        usuario.setAtivo(true);
        usuario.setCriadoEm(LocalDateTime.now());

        if (dto.profissionalId() != null) {
            Profissional profissional = profissionalRepository.findById(dto.profissionalId())
                    .orElseThrow(() -> new IllegalArgumentException("Profissional não encontrado para vínculo."));
            usuario.setProfissional(profissional);
        }

        Usuario salvo = usuarioRepository.save(usuario);
        log.info("Usuário criado com sucesso. ID: {}", salvo.getId());
        return new UsuarioResponseDTO(salvo);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarUsuariosAtivos() {
        return usuarioRepository.findByAtivoTrue().stream().map(UsuarioResponseDTO::new).toList();
    }

    @Transactional
    public UsuarioResponseDTO atualizarUsuario(UUID id, UsuarioUpdateDTO dto) {
        log.info("Iniciando atualização parcial do usuário ID: {}", id);

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (dto.email() != null && !dto.email().isBlank() && !dto.email().equals(usuario.getEmail())) {
            if (usuarioRepository.existsByEmail(dto.email())) {
                throw new IllegalArgumentException("E-mail já está em uso por outro usuário.");
            }
            usuario.setEmail(dto.email());
        }

        if (dto.senha() != null && !dto.senha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dto.senha()));
            log.info("Senha atualizada para o usuário ID: {}", id);
        }

        if (dto.role() != null) {
            usuario.setRole(dto.role());
        }

        if (dto.profissionalId() != null) {
            Profissional profissional = profissionalRepository.findById(dto.profissionalId())
                    .orElseThrow(() -> new IllegalArgumentException("Profissional não encontrado."));
            usuario.setProfissional(profissional);
        }

        Usuario atualizado = usuarioRepository.save(usuario);
        return new UsuarioResponseDTO(atualizado);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodosUsuarios() {
        return usuarioRepository.findAll().stream().map(UsuarioResponseDTO::new).toList();
    }

    @Transactional
    public void alternarStatusUsuario(UUID id) {
        log.info("Iniciando alteração de status do usuário ID: {}", id);
        String emailAdminLogado = securityContext.obterUsuarioLogado();

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (usuario.getEmail().equalsIgnoreCase(emailAdminLogado)) {
            log.warn("Tentativa de auto-bloqueio negada para o admin: {}", emailAdminLogado);
            throw new IllegalStateException("Ação negada: Você não pode alterar o status da sua própria conta.");
        }

        usuario.setAtivo(!usuario.getAtivo());
        usuarioRepository.save(usuario);
        log.info("Status do usuário {} alterado para: {}", usuario.getEmail(), usuario.getAtivo() ? "ATIVO" : "INATIVO");
    }
}