package com.hbu.unimar.service;

import com.hbu.unimar.domain.dto.ProfissionalRequestDTO;
import com.hbu.unimar.domain.dto.ProfissionalResponseDTO;
import com.hbu.unimar.domain.dto.ProfissionalUpdateDTO;
import com.hbu.unimar.domain.entity.Profissional;
import com.hbu.unimar.repository.ProfissionalRepository;
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
public class ProfissionalService {

    private final ProfissionalRepository profissionalRepository;

    @Transactional
    public ProfissionalResponseDTO criarProfissional(ProfissionalRequestDTO dto) {
        log.info("Iniciando registo de profissional. CRM/Coren: {}", dto.crmCoren());

        Profissional profissional = new Profissional();
        profissional.setNomeCompleto(dto.nomeCompleto());
        profissional.setCrmCoren(dto.crmCoren());
        profissional.setEspecialidade(dto.especialidade());
        profissional.setCriadoEm(LocalDateTime.now());
        profissional.setAtivo(true);

        Profissional salvo = profissionalRepository.save(profissional);
        log.info("Profissional registado com sucesso. ID gerado: {}", salvo.getId());

        return new ProfissionalResponseDTO(salvo);
    }

    @Transactional(readOnly = true)
    public List<ProfissionalResponseDTO> listarProfissionaisAtivos() {
        return profissionalRepository.findByAtivoTrue()
                .stream()
                .map(ProfissionalResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProfissionalResponseDTO> listarTodosProfissionais() {
        return profissionalRepository.findAll()
                .stream()
                .map(ProfissionalResponseDTO::new)
                .toList();
    }

    @Transactional
    public ProfissionalResponseDTO atualizarProfissional(UUID id, ProfissionalUpdateDTO dto) {
        log.info("Iniciando atualização parcial do profissional ID: {}", id);

        Profissional profissional = profissionalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Profissional não encontrado."));

        if (dto.nomeCompleto() != null && !dto.nomeCompleto().isBlank()) {
            profissional.setNomeCompleto(dto.nomeCompleto());
        }

        if (dto.crmCoren() != null && !dto.crmCoren().isBlank()) {
            profissional.setCrmCoren(dto.crmCoren());
        }

        if (dto.especialidade() != null) {
            profissional.setEspecialidade(dto.especialidade());
        }

        Profissional atualizado = profissionalRepository.save(profissional);
        return new ProfissionalResponseDTO(atualizado);
    }

    @Transactional
    public void inativarProfissional(UUID id) {
        log.info("Iniciando inativação (Soft Delete) do profissional ID: {}", id);

        Profissional profissional = profissionalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Profissional não encontrado."));

        profissional.setAtivo(false);
        profissionalRepository.save(profissional);
    }
}