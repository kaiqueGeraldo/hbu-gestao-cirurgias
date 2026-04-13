package com.hbu.unimar.service;

import com.hbu.unimar.domain.dto.ProfissionalRequestDTO;
import com.hbu.unimar.domain.dto.ProfissionalResponseDTO;
import com.hbu.unimar.domain.entity.Profissional;
import com.hbu.unimar.repository.ProfissionalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfissionalService {

    private final ProfissionalRepository profissionalRepository;

    @Transactional
    public ProfissionalResponseDTO criarProfissional(ProfissionalRequestDTO dto) {
        log.info("Iniciando registo de profissional. CRM/Coren: {}", dto.crmCoren());

        Profissional profissional = new Profissional();
        profissional.setNomeCompleto(dto.nomeCompleto());
        profissional.setCrmCoren(dto.crmCoren());
        profissional.setEspecialidade(dto.especialidade());
        profissional.setAtivo(true);

        Profissional salvo = profissionalRepository.save(profissional);
        log.info("Profissional registado com sucesso. ID gerado: {}", salvo.getId());

        return new ProfissionalResponseDTO(salvo);
    }

    @Transactional(readOnly = true)
    public List<ProfissionalResponseDTO> listarProfissionais() {
        return profissionalRepository.findAll()
                .stream()
                .map(ProfissionalResponseDTO::new)
                .toList();
    }
}