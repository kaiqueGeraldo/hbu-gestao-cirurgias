package com.hbu.unimar.service;

import com.hbu.unimar.domain.dto.AgendamentoCirurgiaDTO;
import com.hbu.unimar.domain.dto.AtualizacaoStatusCirurgiaDTO;
import com.hbu.unimar.domain.dto.CirurgiaResponseDTO;
import com.hbu.unimar.domain.entity.Cirurgia;
import com.hbu.unimar.domain.entity.CirurgiaHistoricoStatus;
import com.hbu.unimar.domain.entity.Paciente;
import com.hbu.unimar.domain.entity.SalaCirurgica;
import com.hbu.unimar.domain.enums.StatusCirurgia;
import com.hbu.unimar.repository.CirurgiaHistoricoStatusRepository;
import com.hbu.unimar.repository.CirurgiaRepository;
import com.hbu.unimar.repository.PacienteRepository;
import com.hbu.unimar.repository.SalaCirurgicaRepository;
import io.hypersistence.utils.hibernate.type.range.Range;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CirurgiaService {

    private final CirurgiaRepository cirurgiaRepository;
    private final SalaCirurgicaRepository salaRepository;
    private final PacienteRepository pacienteRepository;
    private final CirurgiaHistoricoStatusRepository historicoRepository;

    @Transactional
    public CirurgiaResponseDTO agendarCirurgia(AgendamentoCirurgiaDTO dto) {
        log.info("Iniciando agendamento de cirurgia para o paciente ID: {}, Sala ID: {}", dto.pacienteId(), dto.salaId());

        if (dto.fimPrevisto().isBefore(dto.inicioPrevisto()) || dto.fimPrevisto().isEqual(dto.inicioPrevisto())) {
            log.warn("Tentativa de agendamento com horários inválidos. Início: {}, Fim: {}", dto.inicioPrevisto(), dto.fimPrevisto());
            throw new IllegalArgumentException("O horário de fim deve ser posterior ao horário de início.");
        }

        SalaCirurgica sala = salaRepository.findById(dto.salaId())
                .orElseThrow(() -> new IllegalArgumentException("Sala não encontrada com o ID fornecido."));

        Paciente paciente = pacienteRepository.findById(dto.pacienteId())
                .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado com o ID fornecido."));

        Range<ZonedDateTime> horarioPrevisto = Range.closedOpen(dto.inicioPrevisto(), dto.fimPrevisto());

        Cirurgia novaCirurgia = new Cirurgia();
        novaCirurgia.setSala(sala);
        novaCirurgia.setPaciente(paciente);
        novaCirurgia.setPrioridade(dto.prioridade());
        novaCirurgia.setStatusAtual(StatusCirurgia.AGENDADO);
        novaCirurgia.setHorarioPrevisto(horarioPrevisto);

        Cirurgia cirurgiaSalva = cirurgiaRepository.save(novaCirurgia);
        log.info("Cirurgia agendada com sucesso. ID Gerado: {}", cirurgiaSalva.getId());

        return new CirurgiaResponseDTO(cirurgiaSalva);
    }

    @Transactional
    public CirurgiaResponseDTO atualizarStatus(UUID cirurgiaId, AtualizacaoStatusCirurgiaDTO dto) {
        Cirurgia cirurgia = cirurgiaRepository.findById(cirurgiaId)
                .orElseThrow(() -> new IllegalArgumentException("Cirurgia não encontrada com o ID fornecido."));

        StatusCirurgia statusAnterior = cirurgia.getStatusAtual();

        if (statusAnterior == dto.novoStatus()) {
            log.warn("Tentativa de alterar o status da cirurgia {} para o mesmo status atual ({})", cirurgiaId, statusAnterior);
            throw new IllegalArgumentException("A cirurgia já se encontra no status solicitado.");
        }

        log.info("Alterando status da cirurgia ID: {} de [{}] para [{}]. Usuário responsável: {}",
                cirurgiaId, statusAnterior, dto.novoStatus(), dto.usuarioResponsavel());

        cirurgia.setStatusAtual(dto.novoStatus());
        Cirurgia cirurgiaAtualizada = cirurgiaRepository.save(cirurgia);

        CirurgiaHistoricoStatus historico = new CirurgiaHistoricoStatus();
        historico.setCirurgia(cirurgiaAtualizada);
        historico.setStatusAnterior(statusAnterior);
        historico.setStatusNovo(dto.novoStatus());
        historico.setUsuarioResponsavel(dto.usuarioResponsavel());
        historicoRepository.save(historico);

        return new CirurgiaResponseDTO(cirurgiaAtualizada);
    }
}