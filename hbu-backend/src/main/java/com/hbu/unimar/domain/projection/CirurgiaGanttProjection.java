package com.hbu.unimar.domain.projection;

import java.time.ZonedDateTime;
import java.util.UUID;

public interface CirurgiaGanttProjection {
    UUID getId();
    String getPacienteNome();
    String getSalaNome();
    String getStatusAtual();
    String getPrioridade();

    ZonedDateTime getInicioPrevisto();
    ZonedDateTime getFimPrevisto();

    ZonedDateTime getInicioReal();
    ZonedDateTime getFimReal();
}