package com.hbu.unimar.service;

import com.hbu.unimar.domain.dto.CirurgiaProcedimentoResponseDTO;
import com.hbu.unimar.domain.dto.SincronizacaoProcedimentosDTO;
import com.hbu.unimar.domain.dto.AlocacaoProcedimentoRequestDTO;
import com.hbu.unimar.domain.entity.Cirurgia;
import com.hbu.unimar.domain.entity.CirurgiaProcedimento;
import com.hbu.unimar.domain.entity.ProcedimentoCirurgico;
import com.hbu.unimar.repository.CirurgiaProcedimentoRepository;
import com.hbu.unimar.repository.CirurgiaRepository;
import com.hbu.unimar.repository.ProcedimentoCirurgicoRepository;
import io.hypersistence.utils.hibernate.type.range.Range;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CirurgiaProcedimentoService {

    private final CirurgiaProcedimentoRepository cirurgiaProcedimentoRepository;
    private final CirurgiaRepository cirurgiaRepository;
    private final ProcedimentoCirurgicoRepository procedimentoCirurgicoRepository;

    @Transactional
    public List<CirurgiaProcedimentoResponseDTO> sincronizarProcedimentos(UUID cirurgiaId, SincronizacaoProcedimentosDTO dto) {
        log.info("Iniciando sincronização de procedimentos e recálculo de tempo para a cirurgia: {}", cirurgiaId);

        long qtdPrincipais = dto.procedimentos().stream()
                .filter(AlocacaoProcedimentoRequestDTO::isPrincipal)
                .count();

        if (qtdPrincipais != 1) {
            log.warn("Falha TUSS: Tentativa de salvar {} procedimentos principais na cirurgia {}", qtdPrincipais, cirurgiaId);
            throw new IllegalArgumentException("A cirurgia deve ter exatamente um (1) procedimento marcado como principal.");
        }

        Cirurgia cirurgia = cirurgiaRepository.findById(cirurgiaId)
                .orElseThrow(() -> new IllegalArgumentException("Cirurgia não encontrada."));

        cirurgiaProcedimentoRepository.deleteByCirurgiaId(cirurgiaId);
        cirurgiaProcedimentoRepository.flush();

        int tempoTotalEstimadoMinutos = 0;

        List<CirurgiaProcedimento> novasAlocacoes = dto.procedimentos().stream().map(alocacao -> {
            ProcedimentoCirurgico procedimento = procedimentoCirurgicoRepository.findById(alocacao.procedimentoId())
                    .orElseThrow(() -> new IllegalArgumentException("Procedimento " + alocacao.procedimentoId() + " não encontrado."));

            CirurgiaProcedimento cp = new CirurgiaProcedimento();
            cp.getId().setCirurgiaId(cirurgia.getId());
            cp.getId().setProcedimentoId(procedimento.getId());

            cp.setCirurgia(cirurgia);
            cp.setProcedimento(procedimento);
            cp.setIsPrincipal(alocacao.isPrincipal());

            return cp;
        }).toList();

        tempoTotalEstimadoMinutos = novasAlocacoes.stream()
                .mapToInt(cp -> cp.getProcedimento().getTempoMedioMinutos())
                .sum();

        ZonedDateTime inicioPrevisto = cirurgia.getHorarioPrevisto().lower();
        ZonedDateTime novoFimPrevisto = inicioPrevisto.plusMinutes(tempoTotalEstimadoMinutos);

        Range<ZonedDateTime> novoHorario = Range.closedOpen(inicioPrevisto, novoFimPrevisto);

        log.info("Atualizando duração da cirurgia. Início mantido: {}. Novo fim estimado: {} ({} minutos totais)",
                inicioPrevisto, novoFimPrevisto, tempoTotalEstimadoMinutos);

        cirurgia.setHorarioPrevisto(novoHorario);

        cirurgiaRepository.save(cirurgia);

        List<CirurgiaProcedimento> salvas = cirurgiaProcedimentoRepository.saveAll(novasAlocacoes);

        return salvas.stream().map(CirurgiaProcedimentoResponseDTO::new).toList();
    }
}