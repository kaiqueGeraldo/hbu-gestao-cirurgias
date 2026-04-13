package com.hbu.unimar.repository;

import com.hbu.unimar.domain.entity.ProcedimentoCirurgico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProcedimentoCirurgicoRepository extends JpaRepository<ProcedimentoCirurgico, UUID> {
    List<ProcedimentoCirurgico> findByAtivoTrue();
}