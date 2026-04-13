package com.hbu.unimar.service;

import com.hbu.unimar.domain.dto.AlocacaoMembroRequestDTO;
import com.hbu.unimar.domain.dto.SubstituicaoMembroRequestDTO;
import com.hbu.unimar.domain.dto.MembroEquipeResponseDTO;
import com.hbu.unimar.domain.entity.Cirurgia;
import com.hbu.unimar.domain.entity.CirurgiaEquipe;
import com.hbu.unimar.domain.entity.Profissional;
import com.hbu.unimar.infra.security.SecurityContextService;
import com.hbu.unimar.repository.CirurgiaEquipeRepository;
import com.hbu.unimar.repository.CirurgiaRepository;
import com.hbu.unimar.repository.ProfissionalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CirurgiaEquipeService {

    private final CirurgiaEquipeRepository equipeRepository;
    private final CirurgiaRepository cirurgiaRepository;
    private final ProfissionalRepository profissionalRepository;
    private final SecurityContextService securityContext;

    @Transactional
    public MembroEquipeResponseDTO alocarMembro(UUID cirurgiaId, AlocacaoMembroRequestDTO dto) {
        String usuarioAutenticado = securityContext.obterUsuarioLogado();

        log.info("Iniciando alocação do profissional [{}] na cirurgia [{}]. Papel: {}",
                dto.profissionalId(), cirurgiaId, dto.papel());

        Cirurgia cirurgia = cirurgiaRepository.findById(cirurgiaId)
                .orElseThrow(() -> new IllegalArgumentException("Cirurgia não encontrada."));

        Profissional profissional = profissionalRepository.findById(dto.profissionalId())
                .orElseThrow(() -> new IllegalArgumentException("Profissional não encontrado."));

        CirurgiaEquipe alocacao = new CirurgiaEquipe();
        alocacao.setCirurgia(cirurgia);
        alocacao.setProfissional(profissional);
        alocacao.setPapel(dto.papel());
        alocacao.setUsuarioResponsavelAlocacao(usuarioAutenticado);
        alocacao.setHorarioAlocacao(cirurgia.getHorarioPrevisto());

        CirurgiaEquipe salva = equipeRepository.save(alocacao);
        log.info("Profissional alocado com sucesso. ID da Alocação: {}", salva.getId());

        return new MembroEquipeResponseDTO(salva);
    }

    @Transactional
    public MembroEquipeResponseDTO substituirMembro(UUID alocacaoId, SubstituicaoMembroRequestDTO dto) {
        String usuarioAutenticado = securityContext.obterUsuarioLogado();
        
        log.info("Solicitação de substituição da alocação [{}]. Novo Profissional: [{}]. Motivo: {}",
                alocacaoId, dto.novoProfissionalId(), dto.motivoRemocao());

        CirurgiaEquipe alocacaoAtual = equipeRepository.findById(alocacaoId)
                .orElseThrow(() -> new IllegalArgumentException("Alocação não encontrada."));

        if (!alocacaoAtual.getIsAtivo()) {
            log.warn("Tentativa de substituir uma alocação já inativa (ID: {})", alocacaoId);
            throw new IllegalArgumentException("Não é possível substituir um membro que já se encontra inativo.");
        }

        alocacaoAtual.setIsAtivo(false);
        alocacaoAtual.setRemovidoEm(ZonedDateTime.now());
        alocacaoAtual.setMotivoRemocao(dto.motivoRemocao());
        equipeRepository.save(alocacaoAtual);

        Profissional novoProfissional = profissionalRepository.findById(dto.novoProfissionalId())
                .orElseThrow(() -> new IllegalArgumentException("Novo profissional não encontrado."));

        CirurgiaEquipe novaAlocacao = new CirurgiaEquipe();
        novaAlocacao.setCirurgia(alocacaoAtual.getCirurgia());
        novaAlocacao.setProfissional(novoProfissional);
        novaAlocacao.setPapel(alocacaoAtual.getPapel());
        novaAlocacao.setUsuarioResponsavelAlocacao(usuarioAutenticado);
        novaAlocacao.setHorarioAlocacao(alocacaoAtual.getHorarioAlocacao());

        CirurgiaEquipe salva = equipeRepository.save(novaAlocacao);
        log.info("Substituição concluída com sucesso. Nova alocação ID: {}", salva.getId());

        return new MembroEquipeResponseDTO(salva);
    }
}