package com.hbu.unimar.service;

import com.hbu.unimar.domain.dto.ProcedimentoCirurgicoRequestDTO;
import com.hbu.unimar.domain.dto.ProcedimentoCirurgicoResponseDTO;
import com.hbu.unimar.domain.entity.ProcedimentoCirurgico;
import com.hbu.unimar.repository.ProcedimentoCirurgicoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        procedimento.setTipoSalaExigida(dto.tipoSalaExigida());

        ProcedimentoCirurgico procedimentoSalvo = procedimentoRepository.save(procedimento);
        log.info("Procedimento criado com sucesso. ID gerado: {}", procedimentoSalvo.getId());

        return new ProcedimentoCirurgicoResponseDTO(procedimentoSalvo);
    }

    @Transactional(readOnly = true)
    public List<ProcedimentoCirurgicoResponseDTO> listarProcedimentos() {
        return procedimentoRepository.findAll()
                .stream()
                .map(ProcedimentoCirurgicoResponseDTO::new)
                .toList();
    }
}