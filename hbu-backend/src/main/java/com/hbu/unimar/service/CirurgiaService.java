package com.hbu.unimar.service;

import com.hbu.unimar.domain.dto.*;
import com.hbu.unimar.domain.entity.*;
import com.hbu.unimar.domain.enums.PapelEquipe;
import com.hbu.unimar.domain.enums.RoleUsuario;
import com.hbu.unimar.domain.enums.StatusCirurgia;
import com.hbu.unimar.infra.security.SecurityContextService;
import com.hbu.unimar.repository.*;
import io.hypersistence.utils.hibernate.type.range.Range;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CirurgiaService {

    private final CirurgiaRepository cirurgiaRepository;
    private final SalaCirurgicaRepository salaRepository;
    private final PacienteRepository pacienteRepository;
    private final CirurgiaEquipeRepository cirurgiaEquipeRepository;
    private final CirurgiaHistoricoStatusRepository historicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SecurityContextService securityContext;

    @Transactional
    public CirurgiaResponseDTO agendarCirurgia(AgendamentoCirurgiaDTO dto) {
        log.info("Iniciando agendamento de cirurgia para o paciente ID: {}, Sala ID: {}", dto.pacienteId(), dto.salaId());

        if (dto.fimPrevisto().isBefore(dto.inicioPrevisto()) || dto.fimPrevisto().isEqual(dto.inicioPrevisto())) {
            log.warn("Tentativa de agendamento com horários inválidos. Início: {}, Fim: {}", dto.inicioPrevisto(), dto.fimPrevisto());
            throw new IllegalArgumentException("O horário de fim deve ser posterior ao horário de início.");
        }

        validarDisponibilidadeSala(dto.salaId(), dto.inicioPrevisto(), dto.fimPrevisto(), null);

        SalaCirurgica sala = salaRepository.findById(dto.salaId())
                .orElseThrow(() -> new IllegalArgumentException("Sala não encontrada com o ID fornecido."));

        Paciente paciente = pacienteRepository.findById(dto.pacienteId())
                .orElseThrow(() -> new IllegalArgumentException("Paciente não encontrado com o ID fornecido."));

        Range<ZonedDateTime> horarioPrevisto = Range.closedOpen(dto.inicioPrevisto(), dto.fimPrevisto());

        Cirurgia novaCirurgia = new Cirurgia();
        novaCirurgia.setSala(sala);
        novaCirurgia.setPaciente(paciente);
        novaCirurgia.setPrioridade(dto.prioridade());
        novaCirurgia.setCriadoEm(LocalDateTime.now());
        novaCirurgia.setStatusAtual(StatusCirurgia.AGENDADO);
        novaCirurgia.setHorarioPrevisto(horarioPrevisto);

        Cirurgia cirurgiaSalva = cirurgiaRepository.save(novaCirurgia);
        log.info("Cirurgia agendada com sucesso. ID Gerado: {}", cirurgiaSalva.getId());

        return new CirurgiaResponseDTO(cirurgiaSalva);
    }

    @Transactional
    public CirurgiaResponseDTO atualizarStatus(UUID cirurgiaId, AtualizacaoStatusCirurgiaDTO dto) {
        String usuarioAutenticado = securityContext.obterUsuarioLogado();

        validarTitularidadeMedica(cirurgiaId, usuarioAutenticado);

        log.info("Utilizador [{}] iniciou a atualização da cirurgia ID: {}", usuarioAutenticado, cirurgiaId);

        Cirurgia cirurgia = cirurgiaRepository.findById(cirurgiaId)
                .orElseThrow(() -> new IllegalArgumentException("Cirurgia não encontrada com o ID fornecido."));

        StatusCirurgia statusAnterior = cirurgia.getStatusAtual();

        if (statusAnterior == dto.novoStatus()) {
            log.warn("Tentativa de alterar o status da cirurgia {} para o mesmo status atual ({})", cirurgiaId, statusAnterior);
            throw new IllegalArgumentException("A cirurgia já se encontra no status solicitado.");
        }

        if (dto.novoStatus() == StatusCirurgia.EM_PREPARO || dto.novoStatus() == StatusCirurgia.EM_ANDAMENTO) {
            boolean possuiCirurgiao = cirurgiaEquipeRepository.existsByCirurgiaIdAndPapelAndIsAtivoTrue(
                    cirurgiaId, PapelEquipe.CIRURGIAO_PRINCIPAL);

            boolean possuiAnestesista = cirurgiaEquipeRepository.existsByCirurgiaIdAndPapelAndIsAtivoTrue(
                    cirurgiaId, PapelEquipe.ANESTESISTA);

            if (!possuiCirurgiao || !possuiAnestesista) {
                log.warn("Bloqueio de transição: Cirurgia {} tentou avançar sem equipe mínima.", cirurgiaId);
                throw new IllegalStateException("Transição bloqueada: A cirurgia exige a alocação de um Cirurgião Principal e um Anestesista para iniciar o preparo.");
            }
        }

        log.info("Alterando status da cirurgia ID: {} de [{}] para [{}]. Usuário responsável: {}",
                cirurgiaId, statusAnterior, dto.novoStatus(), dto.usuarioResponsavel());

        cirurgia.setStatusAtual(dto.novoStatus());
        Cirurgia cirurgiaAtualizada = cirurgiaRepository.save(cirurgia);

        CirurgiaHistoricoStatus historico = new CirurgiaHistoricoStatus();
        historico.setCirurgia(cirurgiaAtualizada);
        historico.setStatusAnterior(statusAnterior);
        historico.setStatusNovo(dto.novoStatus());
        historico.setUsuarioResponsavel(usuarioAutenticado);
        historicoRepository.save(historico);

        return new CirurgiaResponseDTO(cirurgiaAtualizada);
    }

    @Transactional
    public CirurgiaResponseDTO finalizarCirurgia(UUID cirurgiaId, EncerramentoCirurgiaDTO dto) {
        String usuarioAutenticado = securityContext.obterUsuarioLogado();

        validarTitularidadeMedica(cirurgiaId, usuarioAutenticado);

        log.info("Utilizador [{}] iniciou a finalização da cirurgia ID: {}", usuarioAutenticado, cirurgiaId);

        if (dto.fimReal().isBefore(dto.inicioReal()) || dto.fimReal().isEqual(dto.inicioReal())) {
            log.warn("Tentativa de encerramento com tempos inválidos na cirurgia {}", cirurgiaId);
            throw new IllegalArgumentException("O horário de fim real deve ser estritamente posterior ao início real.");
        }

        Cirurgia cirurgia = cirurgiaRepository.findById(cirurgiaId)
                .orElseThrow(() -> new IllegalArgumentException("Cirurgia não encontrada com o ID fornecido."));

        StatusCirurgia statusAnterior = cirurgia.getStatusAtual();

        if (statusAnterior != StatusCirurgia.EM_ANDAMENTO && statusAnterior != StatusCirurgia.EM_LIMPEZA) {
            log.warn("Transição de status inválida. Status atual: {}", statusAnterior);
            throw new IllegalStateException("A cirurgia só pode ser finalizada se estiver EM_ANDAMENTO ou EM_LIMPEZA.");
        }

        Range<ZonedDateTime> horarioReal = Range.closedOpen(dto.inicioReal(), dto.fimReal());

        cirurgia.setHorarioReal(horarioReal);
        cirurgia.setStatusAtual(StatusCirurgia.FINALIZADO);

        Cirurgia cirurgiaAtualizada = cirurgiaRepository.save(cirurgia);

        CirurgiaHistoricoStatus historico = new CirurgiaHistoricoStatus();
        historico.setCirurgia(cirurgiaAtualizada);
        historico.setStatusAnterior(statusAnterior);
        historico.setStatusNovo(StatusCirurgia.FINALIZADO);
        historico.setUsuarioResponsavel(usuarioAutenticado);
        historicoRepository.save(historico);

        log.info("Cirurgia {} finalizada com sucesso. Tempo total efetivo registrado.", cirurgiaId);

        return new CirurgiaResponseDTO(cirurgiaAtualizada);
    }

    @Transactional
    public CirurgiaResponseDTO cancelarCirurgia(UUID cirurgiaId, CancelamentoCirurgiaDTO dto) {
        String usuarioAutenticado = securityContext.obterUsuarioLogado();

        log.info("Utilizador [{}] iniciou o cancelamento da cirurgia ID: {}", usuarioAutenticado, cirurgiaId);

        log.info("Iniciando processo crítico de cancelamento da cirurgia ID: {}", cirurgiaId);

        Cirurgia cirurgia = cirurgiaRepository.findById(cirurgiaId)
                .orElseThrow(() -> new IllegalArgumentException("Cirurgia não encontrada com o ID fornecido."));

        StatusCirurgia statusAnterior = cirurgia.getStatusAtual();

        if (statusAnterior == StatusCirurgia.CANCELADO || statusAnterior == StatusCirurgia.FINALIZADO) {
            log.warn("Tentativa inválida de cancelar uma cirurgia que já se encontra em status terminal: {}", statusAnterior);
            throw new IllegalStateException("Não é possível cancelar uma cirurgia que já foi finalizada ou cancelada.");
        }

        cirurgia.setStatusAtual(StatusCirurgia.CANCELADO);
        cirurgia.setMotivoCancelamento(dto.motivoCancelamento());
        Cirurgia cirurgiaAtualizada = cirurgiaRepository.save(cirurgia);

        List<CirurgiaEquipe> equipeAtiva = cirurgiaEquipeRepository.findByCirurgiaIdAndIsAtivoTrue(cirurgiaId);

        if (!equipeAtiva.isEmpty()) {
            ZonedDateTime momentoCancelamento = ZonedDateTime.now();
            String justificativaEquipe = "Cirurgia cancelada pelo usuário " + usuarioAutenticado + ". Motivo original: " + dto.motivoCancelamento();

            equipeAtiva.forEach(alocacao -> {
                alocacao.setIsAtivo(false);
                alocacao.setRemovidoEm(momentoCancelamento);
                alocacao.setMotivoRemocao(justificativaEquipe);
            });

            cirurgiaEquipeRepository.saveAll(equipeAtiva);
            log.info("Cascata de cancelamento aplicada: {} profissionais tiveram suas agendas liberadas.", equipeAtiva.size());
        }

        CirurgiaHistoricoStatus historico = new CirurgiaHistoricoStatus();
        historico.setCirurgia(cirurgiaAtualizada);
        historico.setStatusAnterior(statusAnterior);
        historico.setStatusNovo(StatusCirurgia.CANCELADO);
        historico.setUsuarioResponsavel(usuarioAutenticado);
        historicoRepository.save(historico);

        return new CirurgiaResponseDTO(cirurgiaAtualizada);
    }

    private void validarTitularidadeMedica(UUID cirurgiaId, String emailUsuarioLogado) {
        Usuario usuario = (Usuario) usuarioRepository.findByEmail(emailUsuarioLogado)
                .orElseThrow(() -> new IllegalStateException("Usuário logado não encontrado na base de dados."));

        if (usuario.getRole() == RoleUsuario.ROLE_MEDICO) {

            if (usuario.getProfissional() == null) {
                throw new AccessDeniedException("Conta de médico não possui vínculo com um profissional de saúde cadastrado.");
            }

            boolean pertenceAEquipe = cirurgiaEquipeRepository.existsByCirurgiaIdAndProfissionalIdAndIsAtivoTrue(
                    cirurgiaId, usuario.getProfissional().getId()
            );

            if (!pertenceAEquipe) {
                log.warn("Tentativa de fraude/acesso indevido. Médico {} tentou alterar a cirurgia {}", emailUsuarioLogado, cirurgiaId);
                throw new AccessDeniedException("Acesso negado. Você precisa estar escalado na equipe ativa desta cirurgia para alterá-la.");
            }
        }
    }

    @Transactional
    public CirurgiaResponseDTO reagendarCirurgia(UUID cirurgiaId, ReagendamentoCirurgiaDTO dto) {
        String usuarioAutenticado = securityContext.obterUsuarioLogado();
        log.info("Gestor [{}] solicitou reagendamento (Drag/Drop) da cirurgia ID: {}", usuarioAutenticado, cirurgiaId);

        if (dto.fimPrevisto().isBefore(dto.inicioPrevisto()) || dto.fimPrevisto().isEqual(dto.inicioPrevisto())) {
            throw new IllegalArgumentException("O horário de fim deve ser posterior ao horário de início.");
        }

        Cirurgia cirurgia = cirurgiaRepository.findById(cirurgiaId)
                .orElseThrow(() -> new IllegalArgumentException("Cirurgia não encontrada com o ID fornecido."));

        if (cirurgia.getStatusAtual() == StatusCirurgia.CANCELADO || cirurgia.getStatusAtual() == StatusCirurgia.FINALIZADO) {
            throw new IllegalStateException("Risco de consistência: Não é possível reagendar uma cirurgia que já foi finalizada ou cancelada.");
        }

        validarDisponibilidadeSala(dto.salaId(), dto.inicioPrevisto(), dto.fimPrevisto(), cirurgiaId);

        SalaCirurgica novaSala = salaRepository.findById(dto.salaId())
                .orElseThrow(() -> new IllegalArgumentException("Nova sala não encontrada."));

        cirurgia.setSala(novaSala);
        cirurgia.setHorarioPrevisto(Range.closedOpen(dto.inicioPrevisto(), dto.fimPrevisto()));

        Cirurgia cirurgiaAtualizada = cirurgiaRepository.save(cirurgia);
        log.info("Cirurgia reagendada com sucesso para a sala: {}", novaSala.getNomeNumero());

        return new CirurgiaResponseDTO(cirurgiaAtualizada);
    }

    @Transactional(readOnly = true)
    public CirurgiaResponseDTO buscarPorId(UUID id) {
        Cirurgia cirurgia = cirurgiaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cirurgia não encontrada."));
        return new CirurgiaResponseDTO(cirurgia);
    }

    @Transactional(readOnly = true)
    public List<CirurgiaResponseDTO> listarTodas() {
        log.info("Buscando todas as cirurgias registradas no mapa.");
        return cirurgiaRepository.findAll()
                .stream()
                .map(CirurgiaResponseDTO::new)
                .toList();
    }

    private void validarDisponibilidadeSala(UUID salaId, ZonedDateTime inicio, ZonedDateTime fim, UUID cirurgiaIdAtual) {
        boolean isOcupada;
        if (cirurgiaIdAtual == null) {
            isOcupada = cirurgiaRepository.existsOverlappingCirurgia(salaId, inicio, fim);
        } else {
            isOcupada = cirurgiaRepository.existsOverlappingCirurgiaIgnorandoId(salaId, cirurgiaIdAtual, inicio, fim);
        }

        if (isOcupada) {
            log.warn("Tentativa de agendamento em horário conflitante. Sala ID: {}, Período: {} - {}", salaId, inicio, fim);
            throw new IllegalStateException("Conflito de agendamento: A sala selecionada já possui uma cirurgia prevista para este horário.");
        }
    }

    @Transactional(readOnly = true)
    public List<CirurgiaResponseDTO> listarMinhasCirurgias() {
        String emailUsuarioLogado = securityContext.obterUsuarioLogado();
        log.info("Buscando agenda médica para o usuário: {}", emailUsuarioLogado);

        Usuario usuario = (Usuario) usuarioRepository.findByEmail(emailUsuarioLogado)
                .orElseThrow(() -> new IllegalStateException("Usuário logado não encontrado na base."));

        if (usuario.getProfissional() == null) {
            log.warn("Acesso bloqueado: Usuário Médico {} não possui vínculo com Profissional.", emailUsuarioLogado);
            throw new AccessDeniedException("Sua conta não possui vínculo com um profissional de saúde. Contate o Gestor.");
        }

        UUID profissionalId = usuario.getProfissional().getId();

        return cirurgiaRepository.findCirurgiasAtivasPorProfissional(profissionalId)
                .stream()
                .map(CirurgiaResponseDTO::new)
                .toList();
    }
}