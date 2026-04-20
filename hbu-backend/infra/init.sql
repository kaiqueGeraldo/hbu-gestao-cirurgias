-- Extensões Necessárias para o bloqueio de tempo
CREATE
EXTENSION IF NOT EXISTS btree_gist;
CREATE
EXTENSION IF NOT EXISTS "uuid-ossp";

-- Domínios
CREATE TYPE enum_tipo_sala AS ENUM ('SALA_PADRAO', 'SALA_ALTA_COMPLEXIDADE', 'SALA_PARTO', 'SALA_EMERGENCIA');
CREATE TYPE enum_status_cirurgia AS ENUM ('FILA_ESPERA', 'AGENDADO', 'EM_PREPARO', 'EM_ANDAMENTO', 'EM_LIMPEZA', 'FINALIZADO', 'CANCELADO');
CREATE TYPE enum_prioridade AS ENUM ('EMERGENCIA', 'URGENCIA', 'ELETIVA');
CREATE TYPE enum_papel_equipe AS ENUM ('CIRURGIAO_PRINCIPAL', 'CIRURGIAO_AUXILIAR', 'ANESTESISTA', 'INSTRUMENTADOR', 'ENFERMEIRO_CIRCULANTE');

-- Tabelas Base
CREATE TABLE paciente
(
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome            VARCHAR(150)       NOT NULL,
    cpf             VARCHAR(14)        NOT NULL,
    data_nascimento DATE               NOT NULL,
    ativo           BOOLEAN            DEFAULT TRUE,
    criado_em       TIMESTAMPTZ        DEFAULT CURRENT_TIMESTAMP
);

-- Cria um índice parcial garantindo unicidade apenas para ativos
CREATE UNIQUE INDEX unique_cpf_ativo ON paciente (cpf) WHERE ativo = true;

CREATE TABLE profissional
(
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_completo VARCHAR(150)       NOT NULL,
    crm_coren     VARCHAR(50) UNIQUE NOT NULL,
    especialidade VARCHAR(100),
    ativo         BOOLEAN            DEFAULT TRUE,
    criado_em     TIMESTAMPTZ        DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sala_cirurgica
(
    id                 UUID PRIMARY KEY            DEFAULT uuid_generate_v4(),
    nome_numero        VARCHAR(50) UNIQUE NOT NULL,
    tipo_sala          enum_tipo_sala     NOT NULL DEFAULT 'SALA_PADRAO',
    status_operacional VARCHAR(50)                 DEFAULT 'DISPONIVEL',
    ativo              BOOLEAN                     DEFAULT TRUE,
    criado_em          TIMESTAMPTZ                 DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE procedimento_cirurgico
(
    id                  UUID PRIMARY KEY            DEFAULT uuid_generate_v4(),
    codigo_tuss         VARCHAR(20) UNIQUE NOT NULL,
    descricao           VARCHAR(255)       NOT NULL,
    tempo_medio_minutos INTEGER            NOT NULL CHECK (tempo_medio_minutos > 0),
    tipo_sala_exigida   enum_tipo_sala     NOT NULL DEFAULT 'SALA_PADRAO',
    ativo               BOOLEAN                     DEFAULT TRUE,
    criado_em           TIMESTAMPTZ                 DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cirurgia
(
    id               UUID PRIMARY KEY              DEFAULT uuid_generate_v4(),
    paciente_id      UUID                 NOT NULL REFERENCES paciente (id) ON DELETE RESTRICT,
    sala_id          UUID REFERENCES sala_cirurgica (id) ON DELETE RESTRICT,
    prioridade       enum_prioridade      NOT NULL DEFAULT 'ELETIVA',
    status_atual     enum_status_cirurgia NOT NULL DEFAULT 'FILA_ESPERA',
    horario_previsto TSTZRANGE,
    horario_real     TSTZRANGE,
    motivo_cancelamento TEXT,
    versao           INTEGER              NOT NULL DEFAULT 0,
    criado_em        TIMESTAMPTZ                   DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT prevent_double_booking EXCLUDE USING gist (
        sala_id WITH =,
        horario_previsto WITH &&
    ) WHERE (status_atual != 'CANCELADO' AND sala_id IS NOT NULL AND horario_previsto IS NOT NULL)
);

-- Relacionamentos e Auditoria
CREATE TABLE cirurgia_procedimento
(
    cirurgia_id     UUID REFERENCES cirurgia (id) ON DELETE CASCADE,
    procedimento_id UUID REFERENCES procedimento_cirurgico (id) ON DELETE RESTRICT,
    is_principal    BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (cirurgia_id, procedimento_id)
);

CREATE TABLE cirurgia_equipe
(
    id                           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cirurgia_id                  UUID              NOT NULL REFERENCES cirurgia (id) ON DELETE CASCADE,
    profissional_id              UUID              NOT NULL REFERENCES profissional (id) ON DELETE RESTRICT,
    papel                        enum_papel_equipe NOT NULL,
    is_ativo                     BOOLEAN           NOT NULL DEFAULT TRUE,
    horario_alocacao             TSTZRANGE         NOT NULL,
    alocado_em                   TIMESTAMPTZ       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    removido_em                  TIMESTAMPTZ,
    motivo_remocao               TEXT,
    usuario_responsavel_alocacao VARCHAR(100)      NOT NULL,

    CONSTRAINT prevent_profissional_double_booking EXCLUDE USING gist (
        profissional_id WITH =,
        horario_alocacao WITH &&
    ) WHERE (is_ativo = true)
);

CREATE TABLE cirurgia_historico_status
(
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cirurgia_id         UUID                 NOT NULL REFERENCES cirurgia (id) ON DELETE CASCADE,
    status_anterior     enum_status_cirurgia,
    status_novo         enum_status_cirurgia NOT NULL,
    usuario_responsavel VARCHAR(100)         NOT NULL,
    data_hora           TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuario
(
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(150) UNIQUE NOT NULL,
    senha           VARCHAR(255)        NOT NULL,
    role            VARCHAR(50)         NOT NULL,
    profissional_id UUID REFERENCES profissional (id) ON DELETE SET NULL,
    ativo           BOOLEAN          DEFAULT TRUE,
    criado_em       TIMESTAMPTZ      DEFAULT CURRENT_TIMESTAMP
);

-- Carga inicial: Administrador do Sistema
INSERT INTO usuario (email, senha, role, ativo)
VALUES ('admin@hbu.com.br', '$2a$10$Mj3rvWe5V5YTLCzUl9naguHp2OGkNV/AIfLB0FR2CYpIu3wHkewDK', 'ROLE_ADMIN', true);