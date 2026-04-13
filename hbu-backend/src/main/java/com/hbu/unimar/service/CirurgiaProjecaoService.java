package com.hbu.unimar.service;

import com.hbu.unimar.domain.projection.CirurgiaGanttProjection;
import com.hbu.unimar.repository.CirurgiaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CirurgiaProjecaoService {

    private final CirurgiaRepository cirurgiaRepository;

    public List<CirurgiaGanttProjection> obterMapaCirurgicoDiario(LocalDate dataBase) {
        log.info("Processando projeção do Mapa Cirúrgico (Gantt) para a data: {}", dataBase);

        ZonedDateTime inicioDoDia = dataBase.atStartOfDay(ZoneId.systemDefault());
        ZonedDateTime fimDoDia = dataBase.atTime(23, 59, 59).atZone(ZoneId.systemDefault());

        return cirurgiaRepository.findProjecaoGanttPorPeriodo(inicioDoDia, fimDoDia);
    }
}