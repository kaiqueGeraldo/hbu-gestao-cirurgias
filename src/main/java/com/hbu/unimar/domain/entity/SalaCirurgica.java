package com.hbu.unimar.domain.entity;

import com.hbu.unimar.domain.enums.TipoSala;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

@Entity
@Table(name = "sala_cirurgica")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of = "id")
public class SalaCirurgica {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nome_numero", nullable = false, unique = true, length = 50)
    private String nomeNumero;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM) // Fundamental para Enums nativos do PG
    @Column(name = "tipo_sala", nullable = false)
    private TipoSala tipoSala;

    @Column(name = "status_operacional", length = 50)
    private String statusOperacional;
}