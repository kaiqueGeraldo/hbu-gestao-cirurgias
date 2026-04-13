package com.hbu.unimar.service;

import com.hbu.unimar.domain.dto.PacienteRequestDTO;
import com.hbu.unimar.domain.dto.PacienteResponseDTO;
import com.hbu.unimar.domain.entity.Paciente;
import com.hbu.unimar.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    @Transactional
    public PacienteResponseDTO criarPaciente(PacienteRequestDTO dto) {
        log.info("Iniciando criação de registo de paciente para o nome: {}", dto.nome());

        Paciente paciente = new Paciente();
        paciente.setNome(dto.nome());
        paciente.setCpf(dto.cpf().replaceAll("\\D", ""));
        paciente.setDataNascimento(dto.dataNascimento());
        paciente.setCriadoEm(LocalDateTime.now());

        Paciente pacienteSalvo = pacienteRepository.save(paciente);
        log.info("Registo de paciente criado com sucesso. ID do sistema gerado: {}", pacienteSalvo.getId());

        return new PacienteResponseDTO(pacienteSalvo);
    }

    @Transactional(readOnly = true)
    public List<PacienteResponseDTO> listarPacientes() {
        return pacienteRepository.findAll()
                .stream()
                .map(PacienteResponseDTO::new)
                .toList();
    }
}