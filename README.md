# 🏥 HBU - Sistema de Gestão de Centro Cirúrgico

![Java](https://img.shields.io/badge/java-21-%23ED8B00.svg?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/spring%20boot-4.0.5-%236DB33F.svg?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-15-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.2.6-%23000000.svg?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-5-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

> Sistema corporativo *full-stack* desenvolvido para gerenciamento, acompanhamento e controle operacional do Centro Cirúrgico do Hospital Beneficente Unimar (HBU).

---

## 📑 Índice

- [Visão Geral do Projeto](#-visão-geral-do-projeto)
- [Arquitetura de Perfis (RBAC)](#️-arquitetura-de-perfis-rbac)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Pré-requisitos e Execução Local](#-pré-requisitos-e-execução-local)
- [Variáveis de Ambiente](#️-variáveis-de-ambiente)
- [Massa de Dados (Data Seeder)](#-massa-de-dados-data-seeder)
- [Deploy em Produção](#-deploy-em-produção)
- [Licença e Autoria](#-licença-e-autoria)

---

## 🎯 Visão Geral do Projeto

O **HBU Gestão Cirúrgica** centraliza as informações e processos do centro cirúrgico em uma única plataforma digital, substituindo controles manuais e reduzindo riscos operacionais relacionados ao agendamento, alocação de equipes e acompanhamento dos procedimentos.

A aplicação utiliza uma máquina de estados para controlar o ciclo de vida das cirurgias:

```text
FILA_ESPERA -> AGENDADO → EM_PREPARO → EM_ANDAMENTO → FINALIZADO
```

Esse fluxo garante consistência operacional e impede transições inválidas, como iniciar um procedimento sem a alocação prévia dos profissionais obrigatórios.

---

## 🛡️ Arquitetura de Perfis (RBAC)

O sistema utiliza autenticação baseada em JWT e controle de acesso por perfis (*Role-Based Access Control - RBAC*).

| Perfil | Acesso Restrito a | Objetivo Principal |
|----------|----------|----------|
| **RECEPCAO** | Operacional | Agendamento de cirurgias, cadastro de pacientes e gerenciamento da fila cirúrgica. |
| **MEDICO** | Execução | Consulta da agenda pessoal, atualização de procedimentos e registro de informações cirúrgicas. |
| **GESTOR_CC** | Gestão Operacional | Administração de salas, equipes médicas, escalas e monitoramento do centro cirúrgico. |
| **ADMIN** | Administração do Sistema | Gestão de usuários, permissões, auditoria e manutenção do sistema. |

---

## 💻 Stack Tecnológica

### Backend (API REST)

- **Linguagem:** Java 21
- **Framework:** Spring Boot 4.0.5
- **Persistência:** Spring Data JPA
- **Segurança:** Spring Security + JWT
- **Validação:** Jakarta Validation
- **Banco de Dados:** PostgreSQL
- **Build Tool:** Maven

### Frontend

- **Framework:** Next.js 16
- **Biblioteca:** React 18
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS
- **Animações:** Framer Motion
- **Ícones:** Lucide React
- **Consumo de API:** Fetch API

---

## 📂 Estrutura do Projeto

O repositório é organizado em duas aplicações independentes:

```text
hbu-gestao-cirurgias/
│
├── hbu-backend/
│   ├── infra/
│   │   ├── docker-compose.yml
│   │   └── init.sql
│   │
│   └── src/main/java/.../unimar/
│       ├── controller/
│       ├── domain/
│       ├── infra/
│       ├── repository/
│       └── service/
│
└── hbu-frontend/
    ├── app/
    │   ├── (private)/
    │   └── (public)/
    │
    └── src/
        ├── components/
        ├── contexts/
        ├── services/
        ├── types/
        └── utils/
```

### Estrutura do Backend

| Diretório | Responsabilidade |
|------------|------------------|
| `controller` | Endpoints REST |
| `domain` | Entidades, DTOs, enums e regras de domínio |
| `infra` | Segurança, CORS, exceções e configurações |
| `repository` | Camada de acesso aos dados |
| `service` | Regras de negócio |

### Estrutura do Frontend

| Diretório | Responsabilidade |
|------------|------------------|
| `components` | Componentes reutilizáveis |
| `contexts` | Gerenciamento de estados globais |
| `services` | Integração com a API |
| `types` | Tipagens TypeScript |
| `utils` | Funções auxiliares |

---

## ✨ Funcionalidades Principais

### 📅 Gestão de Agendamentos

- Cadastro e gerenciamento de cirurgias.
- Controle de horários e salas cirúrgicas.
- Atualização do status em tempo real.

### 🏥 Monitoramento de Salas

- Visualização das salas ocupadas e disponíveis.
- Controle operacional do fluxo cirúrgico.
- Atualização dinâmica do andamento dos procedimentos.

### 👨‍⚕️ Gestão de Equipes

- Alocação de médicos e anestesistas.
- Controle de escalas.
- Validação de equipes obrigatórias para início dos procedimentos.

### 📊 Painéis Operacionais

- Acompanhamento de cirurgias em andamento.
- Indicadores de ocupação.
- Visão geral do centro cirúrgico.

### 🔐 Controle de Acessos

- Autenticação JWT.
- Controle de permissões por perfil.
- Bloqueio e desbloqueio de usuários.

---

## 🚀 Pré-requisitos e Execução Local

### Pré-requisitos

- Node.js 18+
- Java JDK 21
- Docker
- Docker Compose
- Maven (opcional)

---

### 1. Subindo o Banco de Dados

Acesse a pasta de infraestrutura:

```bash
cd hbu-backend/infra
docker-compose up -d
```

O PostgreSQL ficará disponível na porta **5432**.

---

### 2. Executando o Backend

```bash
cd hbu-backend

# Linux / Mac
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run

OU execute via IDE
```

API disponível em:

```text
http://localhost:8080/api
```

---

### 3. Executando o Frontend

```bash
cd hbu-frontend

npm install
npm run dev
```

Aplicação disponível em:

```text
http://localhost:3000
```

---

## ⚙️ Variáveis de Ambiente

### Backend

Arquivo:

```text
hbu-backend/src/main/resources/application.yml
```

| Variável | Descrição | Exemplo |
|-----------|-----------|----------|
| `SPRING_DATASOURCE_URL` | URL JDBC do PostgreSQL | `jdbc:postgresql://localhost:5432/hbu_db` |
| `SPRING_DATASOURCE_USERNAME` | Usuário do banco | `admin` |
| `SPRING_DATASOURCE_PASSWORD` | Senha do banco | `adminpassword` |
| `JWT_SECRET` | Chave JWT | `SuaChaveSuperSecreta` |

---

### Frontend

Crie o arquivo:

```text
hbu-frontend/.env.local
```

Conteúdo:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## 📦 Massa de Dados (Data Seeder)

O sistema possui um mecanismo de população automática para ambientes de desenvolvimento e demonstração.

Dados gerados automaticamente:

- Salas cirúrgicas.
- Profissionais da saúde.
- Pacientes.
- Procedimentos.
- Agendamentos de exemplo.

### Importante

Na primeira execução, configure:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
```

Após a criação da estrutura do banco, recomenda-se alterar para:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
```

ou

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: none
```

---

## 🌐 Deploy em Produção

### Backend (Railway / Render)

1. Conecte o repositório à plataforma.
2. Crie uma instância PostgreSQL.
3. Configure as variáveis de ambiente.
4. Realize o deploy da aplicação Spring Boot.

### Frontend (Vercel / Netlify)

1. Importe o projeto `hbu-frontend`.
2. Configure a variável:

```env
NEXT_PUBLIC_API_URL=https://seu-backend.com/api
```

3. Realize o deploy.

### Configuração de CORS

Certifique-se de adicionar o domínio do frontend nas configurações de CORS do backend:

```java
configuration.setAllowedOrigins(
    List.of("https://seu-frontend.com")
);
```

---

## 📄 Licença e Autoria

Projeto desenvolvido como parte das atividades acadêmicas do curso de Ciência da Computação.

**Desenvolvimento:** Kaique Geraldo, Kauã Silva, Mateus Oliveira, Carlos Heinrich, João Vitor, Luiz Antônio, Marcos Tulio 
**Instituição:** Hospital Beneficente Unimar (HBU)  
**Ano:** 2026

© 2026 Todos os direitos reservados.
