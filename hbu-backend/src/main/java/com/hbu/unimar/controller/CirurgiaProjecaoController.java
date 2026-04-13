package com.hbu.unimar.controller;

import com.hbu.unimar.domain.projection.CirurgiaGanttProjection;
import com.hbu.unimar.service.CirurgiaProjecaoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/dashboards")
@RequiredArgsConstructor
public class CirurgiaProjecaoController {

    private final CirurgiaProjecaoService projecaoService;

    @GetMapping("/gantt")
    @PreAuthorize("hasAnyRole('RECEPCAO', 'GESTOR_CC', 'MEDICO', 'ADMIN')")
    public ResponseEntity<List<CirurgiaGanttProjection>> obterGanttDiario(
            @RequestParam("data") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {

        log.info("Requisição HTTP GET para o Dashboard de Gantt na data: {}", data);
        List<CirurgiaGanttProjection> projecao = projecaoService.obterMapaCirurgicoDiario(data);
        return ResponseEntity.ok(projecao);
    }
}