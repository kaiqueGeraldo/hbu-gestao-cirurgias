package com.hbu.unimar.repository;

import com.hbu.unimar.domain.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Optional<UserDetails> findByEmail(String email);
    List<Usuario> findByAtivoTrue();
    boolean existsByEmail(String email);
}