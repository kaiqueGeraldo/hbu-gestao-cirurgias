package com.hbu.unimar.service;

import com.hbu.unimar.domain.dto.SalaCirurgicaRequestDTO;
import com.hbu.unimar.domain.dto.SalaCirurgicaResponseDTO;
import com.hbu.unimar.domain.entity.SalaCirurgica;
import com.hbu.unimar.repository.SalaCirurgicaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

        sala.setStatusOperacional(dto.statusOperacional() != null ? dto.statusOperacional() : "DISPONIVEL");

        SalaCirurgica salaSalva = salaRepository.save(sala);
        log.info("Sala cirúrgica criada com sucesso. ID gerado: {}", salaSalva.getId());

        return new SalaCirurgicaResponseDTO(salaSalva);
    }

    @Transactional(readOnly = true)
    public List<SalaCirurgicaResponseDTO> listarSalas() {
        return salaRepository.findAll()
                .stream()
                .map(SalaCirurgicaResponseDTO::new)
                .toList();
    }
}