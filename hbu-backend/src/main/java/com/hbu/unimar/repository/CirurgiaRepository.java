package com.hbu.unimar.repository;

import com.hbu.unimar.domain.entity.Cirurgia;
import com.hbu.unimar.domain.projection.CirurgiaGanttProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public interface CirurgiaRepository extends JpaRepository<Cirurgia, UUID> {
    @Query(value = """
        SELECT
            c.id AS id,
            p.nome AS pacienteNome,
            s.nome_numero AS salaNome,
            c.status_atual AS statusAtual,
            c.prioridade AS prioridade,
            lower(c.horario_previsto) AS inicioPrevisto,
            upper(c.horario_previsto) AS fimPrevisto,
            lower(c.horario_real) AS inicioReal,
            upper(c.horario_real) AS fimReal
        FROM cirurgia c
        JOIN paciente p ON c.paciente_id = p.id
        JOIN sala_cirurgica s ON c.sala_id = s.id
        WHERE c.status_atual != 'CANCELADO'
        AND c.horario_previsto && tstzrange(CAST(:inicio AS timestamptz), CAST(:fim AS timestamptz), '[]')
        ORDER BY lower(c.horario_previsto) ASC
        """, nativeQuery = true)
    List<CirurgiaGanttProjection> findProjecaoGanttPorPeriodo(
            @Param("inicio") ZonedDateTime inicio,
            @Param("fim") ZonedDateTime fim
    );

    @Query(value = """
        SELECT EXISTS (
            SELECT 1 FROM cirurgia c
            WHERE c.sala_id = :salaId
            AND c.status_atual != 'CANCELADO'
            AND c.horario_previsto && tstzrange(CAST(:inicio AS timestamptz), CAST(:fim AS timestamptz), '[)')
        )
        """, nativeQuery = true)
    boolean existsOverlappingCirurgia(
            @Param("salaId") UUID salaId,
            @Param("inicio") ZonedDateTime inicio,
            @Param("fim") ZonedDateTime fim
    );

    @Query(value = """
        SELECT EXISTS (
            SELECT 1 FROM cirurgia c
            WHERE c.sala_id = :salaId
            AND c.id != CAST(:cirurgiaId AS uuid)
            AND c.status_atual != 'CANCELADO'
            AND c.horario_previsto && tstzrange(CAST(:inicio AS timestamptz), CAST(:fim AS timestamptz), '[)')
        )
        """, nativeQuery = true)
    boolean existsOverlappingCirurgiaIgnorandoId(
            @Param("salaId") UUID salaId,
            @Param("cirurgiaId") UUID cirurgiaId,
            @Param("inicio") ZonedDateTime inicio,
            @Param("fim") ZonedDateTime fim
    );

    @Query(value = """
        SELECT c.* FROM cirurgia c
        JOIN cirurgia_equipe ce ON c.id = ce.cirurgia_id
        WHERE ce.profissional_id = :profissionalId
        AND ce.is_ativo = true
        AND c.status_atual NOT IN ('CANCELADO', 'FINALIZADO')
        ORDER BY lower(c.horario_previsto) ASC
        """, nativeQuery = true)
    List<Cirurgia> findCirurgiasAtivasPorProfissional(@Param("profissionalId") UUID profissionalId);
}