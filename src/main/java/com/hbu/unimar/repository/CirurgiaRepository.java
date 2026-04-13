package com.hbu.unimar.repository;

import com.hbu.unimar.domain.entity.Cirurgia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CirurgiaRepository extends JpaRepository<Cirurgia, UUID> {
}