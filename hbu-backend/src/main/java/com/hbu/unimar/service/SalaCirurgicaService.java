package com.hbu.unimar.service;

import com.hbu.unimar.domain.dto.SalaCirurgicaRequestDTO;
import com.hbu.unimar.domain.dto.SalaCirurgicaResponseDTO;
import com.hbu.unimar.domain.dto.SalaCirurgicaUpdateDTO;
import com.hbu.unimar.domain.entity.SalaCirurgica;
import com.hbu.unimar.repository.SalaCirurgicaRepository;
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
public class SalaCirurgicaService {

    private final SalaCirurgicaRepository salaRepository;

    @Transactional
    public SalaCirurgicaResponseDTO criarSala(SalaCirurgicaRequestDTO dto) {
        log.info("Iniciando criação de sala cirúrgica. Nome/Número: {}, Tipo: {}", dto.nomeNumero(), dto.tipoSala());

        SalaCirurgica sala = new SalaCirurgica();
        sala.setNomeNumero(dto.nomeNumero());
        sala.setTipoSala(dto.tipoSala());
        sala.setCriadoEm(LocalDateTime.now());

        sala.setStatusOperacional(dto.statusOperacional() != null ? dto.statusOperacional() : "DISPONIVEL");

        SalaCirurgica salaSalva = salaRepository.save(sala);
        log.info("Sala cirúrgica criada com sucesso. ID gerado: {}", salaSalva.getId());

        return new SalaCirurgicaResponseDTO(salaSalva);
    }

    @Transactional(readOnly = true)
    public List<SalaCirurgicaResponseDTO> listarSalasAtivas() {
        return salaRepository.findByAtivoTrue()
                .stream()
                .map(SalaCirurgicaResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SalaCirurgicaResponseDTO> listarTodasSalas() {
        return salaRepository.findAll()
                .stream()
                .map(SalaCirurgicaResponseDTO::new)
                .toList();
    }

    @Transactional
    public SalaCirurgicaResponseDTO atualizarSala(UUID id, SalaCirurgicaUpdateDTO dto) {
        log.info("Iniciando atualização parcial da sala cirúrgica ID: {}", id);

        SalaCirurgica sala = salaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sala Cirúrgica não encontrada."));

        if (dto.nomeNumero() != null && !dto.nomeNumero().isBlank()) {
            sala.setNomeNumero(dto.nomeNumero());
        }

        if (dto.tipoSala() != null) {
            sala.setTipoSala(dto.tipoSala());
        }

        if (dto.statusOperacional() != null && !dto.statusOperacional().isBlank()) {
            sala.setStatusOperacional(dto.statusOperacional());
        }

        SalaCirurgica salaAtualizada = salaRepository.save(sala);
        log.info("Sala cirúrgica ID: {} atualizada com sucesso.", id);
        return new SalaCirurgicaResponseDTO(salaAtualizada);
    }

    @Transactional
    public void inativarSala(UUID id) {
        log.info("Iniciando inativação (Soft Delete) da sala cirúrgica ID: {}", id);

        SalaCirurgica sala = salaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Sala Cirúrgica não encontrada."));

        sala.setAtivo(false);
        sala.setStatusOperacional("INATIVA");
        salaRepository.save(sala);
        log.info("Sala cirúrgica ID: {} inativada com sucesso.", id);
    }
}