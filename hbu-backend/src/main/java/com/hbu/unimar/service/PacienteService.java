package com.hbu.unimar.service;

import com.hbu.unimar.domain.dto.PacienteRequestDTO;
import com.hbu.unimar.domain.dto.PacienteResponseDTO;
import com.hbu.unimar.domain.dto.PacienteUpdateDTO;
import com.hbu.unimar.domain.entity.Paciente;
import com.hbu.unimar.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;

    @Transactional
    public PacienteResponseDTO criarPaciente(PacienteRequestDTO dto) {
        String cpfLimpo = dto.cpf().replaceAll("\\D", "");
        log.info("Processando registro de paciente. CPF: {}", cpfLimpo);

        Optional<Paciente> pacienteExistente = pacienteRepository.findByCpf(cpfLimpo);

        if (pacienteExistente.isPresent()) {
            Paciente paciente = pacienteExistente.get();

            if (paciente.getAtivo()) {
                log.warn("Tentativa de cadastro duplicado rejeitada. CPF já encontra-se ativo.");
                throw new IllegalArgumentException("Já existe um paciente ativo cadastrado com este CPF.");
            } else {
                log.info("CPF localizado em registro inativo. Iniciando reativação e atualização do paciente ID: {}", paciente.getId());

                paciente.setNome(dto.nome());
                paciente.setDataNascimento(dto.dataNascimento());
                paciente.setAtivo(true);

                Paciente reativado = pacienteRepository.save(paciente);
                return new PacienteResponseDTO(reativado);
            }
        }

        log.info("CPF inédito. Criando novo registro na base.");
        Paciente novoPaciente = new Paciente();
        novoPaciente.setNome(dto.nome());
        novoPaciente.setCpf(cpfLimpo);
        novoPaciente.setDataNascimento(dto.dataNascimento());
        novoPaciente.setCriadoEm(LocalDateTime.now());
        novoPaciente.setAtivo(true);

        Paciente salvo = pacienteRepository.save(novoPaciente);
        log.info("Paciente criado com sucesso. ID do sistema gerado: {}", salvo.getId());

        return new PacienteResponseDTO(salvo);
    }

    @Transactional(readOnly = true)
    public List<PacienteResponseDTO> listarPacientesAtivos() {
        return pacienteRepository.findByAtivoTrue()
                .stream()
                .map(PacienteResponseDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PacienteResponseDTO> listarTodosPacientes() {
        return pacienteRepository.findAll()
                .stream()
                .map(PacienteResponseDTO::new)
                .toList();
    }

    @Transactional
    public PacienteResponseDTO atualizarPaciente(UUID id, PacienteUpdateDTO dto) {
        log.info("Iniciando atualização parcial do paciente ID: {}", id);

        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado."));

        if (dto.nome() != null && !dto.nome().isBlank()) {
            paciente.setNome(dto.nome());
        }

        if (dto.cpf() != null && !dto.cpf().isBlank()) {
            paciente.setCpf(dto.cpf().replaceAll("\\D", ""));
        }

        if (dto.dataNascimento() != null) {
            paciente.setDataNascimento(dto.dataNascimento());
        }

        Paciente pacienteAtualizado = pacienteRepository.save(paciente);
        log.info("Paciente ID: {} atualizado com sucesso.", id);
        return new PacienteResponseDTO(pacienteAtualizado);
    }

    @Transactional
    public void inativarPaciente(UUID id) {
        log.info("Iniciando inativação (Soft Delete) do paciente ID: {}", id);

        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado."));

        paciente.setAtivo(false);
        pacienteRepository.save(paciente);
        log.info("Paciente ID: {} inativado com sucesso.", id);
    }
}