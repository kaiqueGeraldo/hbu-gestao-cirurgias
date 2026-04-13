package com.hbu.unimar.repository;

import com.hbu.unimar.domain.entity.CirurgiaEquipe;
import com.hbu.unimar.domain.enums.PapelEquipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CirurgiaEquipeRepository extends JpaRepository<CirurgiaEquipe, UUID> {

    List<CirurgiaEquipe> findByCirurgiaIdAndIsAtivoTrue(UUID cirurgiaId);

    boolean existsByCirurgiaIdAndPapelAndIsAtivoTrue(UUID cirurgiaId, PapelEquipe papel);

    boolean existsByCirurgiaIdAndProfissionalIdAndIsAtivoTrue(UUID cirurgiaId, UUID profissionalId);
}