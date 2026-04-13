package com.hbu.unimar.repository;

import com.hbu.unimar.domain.entity.SalaCirurgica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SalaCirurgicaRepository extends JpaRepository<SalaCirurgica, UUID> {
    List<SalaCirurgica> findByAtivoTrue();
}