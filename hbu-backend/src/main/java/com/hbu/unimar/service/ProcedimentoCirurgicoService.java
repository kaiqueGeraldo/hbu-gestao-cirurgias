package com.hbu.unimar.service;

import com.hbu.unimar.domain.dto.ProcedimentoCirurgicoRequestDTO;
import com.hbu.unimar.domain.dto.ProcedimentoCirurgicoResponseDTO;
import com.hbu.unimar.domain.dto.ProcedimentoCirurgicoUpdateDTO;
import com.hbu.unimar.domain.entity.ProcedimentoCirurgico;
import com.hbu.unimar.repository.ProcedimentoCirurgicoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProcedimentoCirurgicoService {

    private final ProcedimentoCirurgicoRepository procedimentoRepository;

    @Transactional
    public ProcedimentoCirurgicoResponseDTO criarProcedimento(ProcedimentoCirurgicoRequestDTO dto) {
        log.info("Iniciando criação de procedimento cirúrgico. Código TUSS: {}", dto.codigoTuss());

        ProcedimentoCirurgico procedimento = new ProcedimentoCirurgico();
        procedimento.setCodigoTuss(dto.codigoTuss());
        procedimento.setDescricao(dto.descricao());
        procedimento.setTempoMedioMinutos(dto.tempoMedioMinutos());
        procedimento.setCriadoEm(LocalDateTime.now());
        procedimento.setTipoSalaExigida(dto.tipoSalaExigida());

        ProcedimentoCirurgico procedimentoSalvo = procedimentoRepository.save(procedimento);
        log.info("Procedimento criado com sucesso. ID gerado: {}", procedimentoSalvo.getId());

        return new ProcedimentoCirurgicoResponseDTO(procedimentoSalvo);
    }

    @Transactional(readOnly = true)
    public List<ProcedimentoCirurgicoResponseDTO> listarProcedimentosAtivos() {
        return procedimentoRepository.findByAtivoTrue()
                .stream()
                .map(ProcedimentoCirurgicoResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProcedimentoCirurgicoResponseDTO> listarTodosProcedimentos() {
        return procedimentoRepository.findAll()
                .stream()
                .map(ProcedimentoCirurgicoResponseDTO::new)
                .toList();
    }

    @Transactional
    public ProcedimentoCirurgicoResponseDTO atualizarProcedimento(UUID id, ProcedimentoCirurgicoUpdateDTO dto) {
        log.info("Iniciando atualização parcial do procedimento cirúrgico ID: {}", id);

        ProcedimentoCirurgico procedimento = procedimentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Procedimento Cirúrgico não encontrado."));

        if (dto.codigoTuss() != null && !dto.codigoTuss().isBlank()) {
            procedimento.setCodigoTuss(dto.codigoTuss());
        }

        if (dto.descricao() != null && !dto.descricao().isBlank()) {
            procedimento.setDescricao(dto.descricao());
        }

        if (dto.tempoMedioMinutos() != null && dto.tempoMedioMinutos() > 0) {
            procedimento.setTempoMedioMinutos(dto.tempoMedioMinutos());
        }

        if (dto.tipoSalaExigida() != null) {
            procedimento.setTipoSalaExigida(dto.tipoSalaExigida());
        }

        ProcedimentoCirurgico procedimentoAtualizado = procedimentoRepository.save(procedimento);
        log.info("Procedimento ID: {} atualizado com sucesso.", id);
        return new ProcedimentoCirurgicoResponseDTO(procedimentoAtualizado);
    }

    @Transactional
    public void inativarProcedimento(UUID id) {
        log.info("Iniciando inativação (Soft Delete) do procedimento cirúrgico ID: {}", id);

        ProcedimentoCirurgico procedimento = procedimentoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Procedimento Cirúrgico não encontrado."));

        procedimento.setAtivo(false);
        procedimentoRepository.save(procedimento);
        log.info("Procedimento cirúrgico ID: {} inativado com sucesso.", id);
    }
}