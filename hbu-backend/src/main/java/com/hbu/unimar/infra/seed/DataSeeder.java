package com.hbu.unimar.infra.seed;

import com.hbu.unimar.domain.dto.*;
import com.hbu.unimar.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
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
        var s1 = salaService.criarSala(new SalaCirurgicaRequestDTO("Sala 01", "SALA_PADRAO", "DISPONIVEL"));
        var s2 = salaService.criarSala(new SalaCirurgicaRequestDTO("Sala 02", "SALA_PADRAO", "DISPONIVEL"));
        var s3 = salaService.criarSala(new SalaCirurgicaRequestDTO("Sala 03", "SALA_ALTA_COMPLEXIDADE", "DISPONIVEL"));
        var s4 = salaService.criarSala(new SalaCirurgicaRequestDTO("Sala 04", "SALA_ALTA_COMPLEXIDADE", "DISPONIVEL"));
        var s5 = salaService.criarSala(new SalaCirurgicaRequestDTO("Sala 05 - Parto", "SALA_PARTO", "DISPONIVEL"));
        var s6 = salaService.criarSala(new SalaCirurgicaRequestDTO("Sala 06 - Trauma", "SALA_EMERGENCIA", "DISPONIVEL"));

        // 3. Criar Profissionais (10 profissionais)
        var p1 = profissionalService.criarProfissional(new ProfissionalRequestDTO("Dr. Kaique Santos", "CRM 11111", "CIRURGIA_GERAL"));
        var p2 = profissionalService.criarProfissional(new ProfissionalRequestDTO("Dr. Kauã Silva", "CRM 22222", "ANESTESIOLOGIA"));
        var p3 = profissionalService.criarProfissional(new ProfissionalRequestDTO("Dra. Gabi Silva", "CRM 33333", "ORTOPEDIA"));
        var p4 = profissionalService.criarProfissional(new ProfissionalRequestDTO("Dr. Mateus Oliveira", "CRM 44444", "CIRURGIA_GERAL"));
        var p5 = profissionalService.criarProfissional(new ProfissionalRequestDTO("Dra. Fernanda Lima", "CRM 55555", "ANESTESIOLOGIA"));
        profissionalService.criarProfissional(new ProfissionalRequestDTO("Enf. Carlos Heinrich", "COREN 66666", "ENFERMAGEM"));
        profissionalService.criarProfissional(new ProfissionalRequestDTO("Enf. João Vitor", "COREN 77777", "ENFERMAGEM"));
        profissionalService.criarProfissional(new ProfissionalRequestDTO("Dr. Luiz Antônio", "CRM 88888", "ORTOPEDIA"));
        profissionalService.criarProfissional(new ProfissionalRequestDTO("Dr. Marcos Tulio", "CRM 99999", "CIRURGIA_GERAL"));
        profissionalService.criarProfissional(new ProfissionalRequestDTO("Dra. Amanda Rocha", "CRM 10101", "ANESTESIOLOGIA"));

        // 4. Criar Pacientes (12 pacientes)
        var pac1 = pacienteService.criarPaciente(new PacienteRequestDTO("João da Silva", "11122233344", "1980-05-15"));
        var pac2 = pacienteService.criarPaciente(new PacienteRequestDTO("Maria Oliveira", "22233344455", "1992-08-20"));
        var pac3 = pacienteService.criarPaciente(new PacienteRequestDTO("Carlos Pereira", "33344455566", "1975-11-10"));
        var pac4 = pacienteService.criarPaciente(new PacienteRequestDTO("Ana Costa", "44455566677", "2000-02-25"));
        var pac5 = pacienteService.criarPaciente(new PacienteRequestDTO("Pedro Santos", "55566677788", "1988-06-30"));
        var pac6 = pacienteService.criarPaciente(new PacienteRequestDTO("Lucas Ferreira", "66677788899", "1995-09-05"));
        var pac7 = pacienteService.criarPaciente(new PacienteRequestDTO("Mariana Lima", "77788899900", "1982-12-12"));
        var pac8 = pacienteService.criarPaciente(new PacienteRequestDTO("Fernando Gomes", "88899900011", "1970-04-18"));
        var pac9 = pacienteService.criarPaciente(new PacienteRequestDTO("Beatriz Martins", "99900011122", "1998-07-22"));
        var pac10 = pacienteService.criarPaciente(new PacienteRequestDTO("Rafael Carvalho", "12121212121", "1985-10-08"));
        var pac11 = pacienteService.criarPaciente(new PacienteRequestDTO("Juliana Ribeiro", "23232323232", "1990-01-14"));
        var pac12 = pacienteService.criarPaciente(new PacienteRequestDTO("Diego Araújo", "34343434343", "1978-03-27"));

        // 5. Criar Procedimentos TUSS (8 procedimentos)
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("31005470", "Apendicectomia", 90, "SALA_PADRAO"));
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("31009220", "Colecistectomia Videolaparoscópica", 120, "SALA_ALTA_COMPLEXIDADE"));
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("30715018", "Artroplastia Total do Joelho", 180, "SALA_ALTA_COMPLEXIDADE"));
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("31309054", "Cesariana", 60, "SALA_PARTO"));
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("30205095", "Traqueostomia", 45, "SALA_EMERGENCIA"));
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("30906107", "Revascularização Miocárdica", 240, "SALA_ALTA_COMPLEXIDADE"));
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("31102026", "Herniorrafia Inguinal", 60, "SALA_PADRAO"));
        procedimentoService.criarProcedimento(new ProcedimentoCirurgicoRequestDTO("30602264", "Amigdalectomia", 45, "SALA_PADRAO"));

        // 6. Agendar Cirurgias
        // DIA 11
        String dia11 = "2026-06-11";
        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(pac1.id().toString(), s1.id().toString(), "ELETIVA", dia11 + "T08:00:00-03:00", dia11 + "T10:00:00-03:00"));
        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(pac2.id().toString(), s2.id().toString(), "URGENCIA", dia11 + "T10:30:00-03:00", dia11 + "T12:30:00-03:00"));

        // DIA 12
        String dia12 = "2026-06-12";
        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(pac3.id().toString(), s1.id().toString(), "ELETIVA", dia12 + "T07:00:00-03:00", dia12 + "T09:00:00-03:00"));
        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(pac4.id().toString(), s2.id().toString(), "ELETIVA", dia12 + "T08:30:00-03:00", dia12 + "T11:00:00-03:00"));
        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(pac5.id().toString(), s3.id().toString(), "URGENCIA", dia12 + "T10:00:00-03:00", dia12 + "T14:00:00-03:00"));
        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(pac6.id().toString(), s4.id().toString(), "ELETIVA", dia12 + "T13:00:00-03:00", dia12 + "T15:30:00-03:00"));
        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(pac7.id().toString(), s5.id().toString(), "ELETIVA", dia12 + "T14:00:00-03:00", dia12 + "T16:00:00-03:00"));
        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(pac8.id().toString(), s6.id().toString(), "EMERGENCIA", dia12 + "T16:30:00-03:00", dia12 + "T18:00:00-03:00"));

        // DIA 13
        String dia13 = "2026-06-13";
        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(pac9.id().toString(), s1.id().toString(), "ELETIVA", dia13 + "T08:00:00-03:00", dia13 + "T09:30:00-03:00"));
        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(pac10.id().toString(), s2.id().toString(), "ELETIVA", dia13 + "T09:00:00-03:00", dia13 + "T11:00:00-03:00"));
        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(pac11.id().toString(), s3.id().toString(), "URGENCIA", dia13 + "T13:00:00-03:00", dia13 + "T15:00:00-03:00"));
        cirurgiaService.agendarCirurgia(new AgendamentoCirurgiaDTO(pac12.id().toString(), s4.id().toString(), "ELETIVA", dia13 + "T15:30:00-03:00", dia13 + "T17:30:00-03:00"));

        log.info("Massa de dados injetada com sucesso!");
        SecurityContextHolder.clearContext();
    }
}