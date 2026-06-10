package com.hbu.unimar.infra.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Map<String, String> response = new HashMap<>();

        String mensagemCausaRaiz = ex.getMostSpecificCause().getMessage();

        if (mensagemCausaRaiz != null && mensagemCausaRaiz.contains("prevent_double_booking")) {
            log.warn("Bloqueada tentativa de agendamento duplicado (prevent_double_booking). Detalhes: {}", mensagemCausaRaiz);
            response.put("erro", "Conflito de Agendamento");
            response.put("mensagem", "Já existe uma cirurgia agendada para esta sala neste mesmo período.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        if (mensagemCausaRaiz != null && mensagemCausaRaiz.contains("cpf")) {
            log.warn("Bloqueada tentativa de registo com CPF duplicado.");
            response.put("erro", "Dados Duplicados");
            response.put("mensagem", "Já existe um paciente cadastrado com este CPF.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        if (mensagemCausaRaiz != null && mensagemCausaRaiz.contains("prevent_profissional_double_booking")) {
            log.warn("Bloqueada alocação duplicada de profissional (prevent_profissional_double_booking). Detalhes: {}", mensagemCausaRaiz);
            response.put("erro", "Conflito de Agenda Médica");
            response.put("mensagem", "O profissional selecionado já possui outra cirurgia ou procedimento agendado neste exato período.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        log.error("Erro de integridade de dados não mapeado capturado durante o processamento", ex);
        response.put("erro", "Erro de Integridade de Dados");
        response.put("mensagem", "Não foi possível processar a requisição devido a um conflito de dados.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Falha de validação nos dados de entrada da requisição: {}", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<StandardError> handleIllegalArgumentException(IllegalArgumentException ex, HttpServletRequest request) {

        StandardError error = new StandardError(
                Instant.now(),
                HttpStatus.CONFLICT.value(),
                "Conflito de Regra de Negócio",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<StandardError> handleIllegalStateException(IllegalStateException ex, HttpServletRequest request) {

        log.warn("Bloqueio por regra de estado/negócio: {}", ex.getMessage());

        StandardError error = new StandardError(
                Instant.now(),
                HttpStatus.CONFLICT.value(),
                "Conflito de Regra de Negócio / Estado Inválido",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
}