package com.hbu.unimar.repository;

import com.hbu.unimar.domain.entity.CirurgiaProcedimento;
import com.hbu.unimar.domain.entity.pk.CirurgiaProcedimentoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CirurgiaProcedimentoRepository extends JpaRepository<CirurgiaProcedimento, CirurgiaProcedimentoId> {

    List<CirurgiaProcedimento> findByCirurgiaId(UUID cirurgiaId);

    @Modifying
    @Query("DELETE FROM CirurgiaProcedimento cp WHERE cp.id.cirurgiaId = :cirurgiaId")
    void deleteByCirurgiaId(@Param("cirurgiaId") UUID cirurgiaId);
}