package com.hbu.unimar.infra.seed;

import com.hbu.unimar.domain.dto.*;
import com.hbu.unimar.domain.enums.*;
import com.hbu.unimar.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SalaCirurgicaService salaService;
    private final ProfissionalService profissionalService;
    private final PacienteService pacienteService;
    private final ProcedimentoCirurgicoService procedimentoService;
    private final CirurgiaService cirurgiaService;

    @Override
    public void run(String... args) {
        // Verifica se o banco já está populado para não duplicar dados
        if (!salaService.listarTodasSalas().isEmpty()) {
            log.info("Banco de dados já populado. Pulando DataSeeder.");
            return;
        }

        log.info("Iniciando injeção de massa de dados para apresentação...");

        // 1. Simula um usuário ADMIN logado para burlar a segurança dos Services
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin@hbu.com.br", null,
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
        );

        // 2. Criar Salas (6 salas)
        var s1 = salaService.criarSala(new SalaCirurgicaRequestDTO("Sala 01", TipoSala.SALA_PADRAO, "DISPONIVEL"));
        var s2 = salaService.criarSala(new SalaCirurgicaRequestDTO("Sala 02", TipoSala.SALA_PADRAO, "DISPONIVEL"));
        var s3 = salaService.criarSala(new SalaCirurgicaRequestDTO("Sala 03", TipoSala.SALA_ALTA_COMPLEXIDADE, "DISPONIVEL"));
        var s4 = salaService.criarSala(new SalaCirurgicaRequestDTO("Sala 04", TipoSala.SALA_ALTA_COMPLEXIDADE, "DISPONIVEL"));
        var s5 = salaService.criarSala(new SalaCirurgicaRequestDTO("Sala 05 - Parto", TipoSala.SALA_PARTO, "DISPONIVEL"));
        var s6 = salaService.criarSala(new SalaCirurgicaRequestDTO("Sala 06 - Trauma", TipoSala.SALA_EMERGENCIA, "DISPONIVEL"));

        // 3. Criar Profissionais (10 profissionais)
        profissionalService.criarProfissional(new ProfissionalRequestDTO("Dr. Kaique Santos",  "CRM 11111", "Cirurgia Geral"));
        profissionalService.criarProfissional(new ProfissionalRequestDTO("Dr. Kauã Silva",     "CRM 22222", "Anestesiologia"));
        profissionalService.criarProfissional(new ProfissionalRequestDTO("Dra. Gabi Silva",    "CRM 33333", "Instrumentação Cirúrgica"));
        profissionalService.criarProfissional(new ProfissionalRequestDTO("Dr. Mateus Oliveira","CRM 44444", "Cirurgia Geral"));
        profissionalService.criarProfissional(new ProfissionalRequestDTO("Dra. Fernanda Lima", "CRM 55555", "Anestesiologia"));
        profissionalService.criarProfissional(new ProfissionalRequestDTO("Enf. Carlos Heinrich","COREN 66666", "Enfermagem Cirúrgica"));
        profissionalService.criarProfissional(new ProfissionalRequestDTO("Enf. João Vitor",    "COREN 77777", "Enfermagem Cirúrgica"));
        profissionalService.criarProfissional(new ProfissionalRequestDTO("Dr. Luiz Antônio",   "CRM 88888", "Instrumentação Cirúrgica"));
        profissionalService.criarProfissional(new ProfissionalRequestDTO("Dr. Marcos Tulio",   "CRM 99999", "Cirurgia Geral"));
        profissionalService.criarProfissional(new ProfissionalRequestDTO("Dra. Amanda Rocha",  "CRM 10101", "Anestesiologia"));

        // 4. Criar Pacientes (12 pacientes)
        var pac1  = pacienteService.criarPaciente(new PacienteRequestDTO("João da Silva",    "111.222.333-44", LocalDate.of(1980,  5, 15)));
        var pac2  = pacienteService.criarPaciente(new PacienteRequestDTO("Maria Oliveira",   "222.333.444-55", LocalDate.of(1992,  8, 20)));
        var pac3  = pacienteService.criarPaciente(new PacienteRequestDTO("Carlos Pereira",   "333.444.555-66", LocalDate.of(1975, 11, 10)));
        var pac4  = pacienteService.criarPaciente(new PacienteRequestDTO("Ana Costa",        "444.555.666-77", LocalDate.of(2000,  2, 25)));
        var pac5  = pacienteService.criarPaciente(new PacienteRequestDTO("Pedro Santos",     "555.666.777-88", LocalDate.of(1988,  6, 30)));
        var pac6  = pacienteService.criarPaciente(new PacienteRequestDTO("Lucas Ferreira",   "666.777.888-99", LocalDate.of(1995,  9,  5)));
        var pac7  = pacienteService.criarPaciente(new PacienteRequestDTO("Mariana Lima",     "777.888.999-00", LocalDate.of(1982, 12, 12)));
        var pac8  = pacienteService.criarPaciente(new PacienteRequestDTO("Fernando Gomes",   "888.999.000-11", LocalDate.of(1970,  4, 18)));
        var pac9  = pacienteService.criarPaciente(new PacienteRequestDTO("Beatriz Martins",  "999.000.111-22", LocalDate.of(1998,  7, 22)));
        var pac10 = pacienteService.criarPaciente(new PacienteRequestDTO("Rafael Carvalho",  "121.212.121-21", LocalDate.of(1985, 10,  8)));
        var pac11 = pacienteService.criarPaciente(new PacienteRequestDTO("Juliana Ribeiro",  "232.323.232-32", LocalDate.of(1990,  1, 14)));
        var pac12 = pacienteService.criarPaciente(new PacienteRequestDTO("Diego Araújo",     "343.434.343-43", LocalDate.of(1978,  3, 27)));

        // 5. Criar Procedimentos TUSS (8 procedimentos)
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("31005470", "Apendicectomia",                    90,  TipoSala.SALA_PADRAO));
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("31009220", "Colecistectomia Videolaparoscópica", 120, TipoSala.SALA_ALTA_COMPLEXIDADE));
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("30715018", "Artroplastia Total do Joelho",       180, TipoSala.SALA_ALTA_COMPLEXIDADE));
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("31309054", "Cesariana",                          60, TipoSala.SALA_PARTO));
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("30205095", "Traqueostomia",                      45, TipoSala.SALA_EMERGENCIA));
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("30906107", "Revascularização Miocárdica",        240, TipoSala.SALA_ALTA_COMPLEXIDADE));
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("31102026", "Herniorrafia Inguinal",               60, TipoSala.SALA_PADRAO));
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("30602264", "Amigdalectomia",                     45, TipoSala.SALA_PADRAO));

        // 6. Agendar Cirurgias
        // DIA 11
        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(
                pac1.id(), s1.id(), Prioridade.ELETIVA,
                ZonedDateTime.parse("2026-06-11T08:00:00-03:00"),
                ZonedDateTime.parse("2026-06-11T10:00:00-03:00")));

        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(
                pac2.id(), s2.id(), Prioridade.URGENCIA,
                ZonedDateTime.parse("2026-06-11T10:30:00-03:00"),
                ZonedDateTime.parse("2026-06-11T12:30:00-03:00")));

        // DIA 12
        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(
                pac3.id(), s1.id(), Prioridade.ELETIVA,
                ZonedDateTime.parse("2026-06-12T07:00:00-03:00"),
                ZonedDateTime.parse("2026-06-12T09:00:00-03:00")));

        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(
                pac4.id(), s2.id(), Prioridade.ELETIVA,
                ZonedDateTime.parse("2026-06-12T08:30:00-03:00"),
                ZonedDateTime.parse("2026-06-12T11:00:00-03:00")));

        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(
                pac5.id(), s3.id(), Prioridade.URGENCIA,
                ZonedDateTime.parse("2026-06-12T10:00:00-03:00"),
                ZonedDateTime.parse("2026-06-12T14:00:00-03:00")));

        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(
                pac6.id(), s4.id(), Prioridade.ELETIVA,
                ZonedDateTime.parse("2026-06-12T13:00:00-03:00"),
                ZonedDateTime.parse("2026-06-12T15:30:00-03:00")));

        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(
                pac7.id(), s5.id(), Prioridade.ELETIVA,
                ZonedDateTime.parse("2026-06-12T14:00:00-03:00"),
                ZonedDateTime.parse("2026-06-12T16:00:00-03:00")));

        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(
                pac8.id(), s6.id(), Prioridade.EMERGENCIA,
                ZonedDateTime.parse("2026-06-12T16:30:00-03:00"),
                ZonedDateTime.parse("2026-06-12T18:00:00-03:00")));

        // DIA 13
        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(
                pac9.id(), s1.id(), Prioridade.ELETIVA,
                ZonedDateTime.parse("2026-06-13T08:00:00-03:00"),
                ZonedDateTime.parse("2026-06-13T09:30:00-03:00")));

        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(
                pac10.id(), s2.id(), Prioridade.ELETIVA,
                ZonedDateTime.parse("2026-06-13T09:00:00-03:00"),
                ZonedDateTime.parse("2026-06-13T11:00:00-03:00")));

        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(
                pac11.id(), s3.id(), Prioridade.URGENCIA,
                ZonedDateTime.parse("2026-06-13T13:00:00-03:00"),
                ZonedDateTime.parse("2026-06-13T15:00:00-03:00")));

        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(
                pac12.id(), s4.id(), Prioridade.ELETIVA,
                ZonedDateTime.parse("2026-06-13T15:30:00-03:00"),
                ZonedDateTime.parse("2026-06-13T17:30:00-03:00")));

        log.info("Massa de dados injetada com sucesso!");
        SecurityContextHolder.clearContext();
    }
}