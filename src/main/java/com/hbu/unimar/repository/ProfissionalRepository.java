package com.hbu.unimar.repository;

import com.hbu.unimar.domain.entity.Profissional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProfissionalRepository extends JpaRepository<Profissional, UUID> {
}