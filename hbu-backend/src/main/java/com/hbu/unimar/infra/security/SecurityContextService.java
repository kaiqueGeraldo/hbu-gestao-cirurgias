package com.hbu.unimar.infra.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityContextService {

    public String obterUsuarioLogado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalStateException("Nenhum utilizador autenticado encontrado no contexto de segurança.");
        }

        return authentication.getName();
    }
}