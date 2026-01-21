📝 **Task: Cadastro de Pacientes e Exames Médicos com Modalidades DICOM**

🎯 **Descrição**

Como usuário da plataforma médica,  
Quero registrar e consultar pacientes e seus exames de forma segura, consistente e com boa experiência de navegação,  
Para que eu tenha controle sobre o histórico clínico mesmo em situações de reenvio de requisição ou acessos simultâneos.

⸻

🔧 **Escopo da Task**

- Implementar endpoints REST para cadastro e consulta de pacientes e exames.
- Garantir idempotência no cadastro de exames.
- Criar estrutura segura para suportar requisições concorrentes.
- Implementar paginação para consultas.
- Integrar com front-end Angular.
- Criar componentes Angular para cadastro e listagem de pacientes e exames.
- Utilizar práticas RESTful, transações ACID e código modular.

⸻

✅ **Regras de Validações**

- O `documento` do paciente deve ser único.
- A `idempotencyKey` do exame deve garantir que requisições duplicadas não criem múltiplos registros.
- Não é permitido cadastrar exame para paciente inexistente.
- Campos obrigatórios devem ser validados (nome, data de nascimento, modalidade, etc).

⸻

📦 **Saída Esperada**

- Endpoints criados:
  - `POST /pacientes`
  - `GET /pacientes?page=x&pageSize=y`
  - `POST /exames`
  - `GET /exames?page=x&pageSize=y`
- Dados persistidos de forma segura e idempotente.
- Front-end com:
  - Listagem paginada de pacientes e exames.
  - Cadastro funcional via formulários.
  - UI amigável com mensagens de erro e loading.

⸻

🔥 **Critérios de Aceite**

- **Dado** que um paciente válido foi cadastrado,  
  **Quando** for enviado um novo exame com `idempotencyKey` única,  
  **Então** o exame deverá ser criado com sucesso.

- **Dado** que um exame com `idempotencyKey` já existe,  
  **Quando** for enviada uma nova requisição com os mesmos dados,  
  **Então** o sistema deverá retornar HTTP 200 com o mesmo exame, sem recriá-lo.

- **Dado** que múltiplas requisições simultâneas com mesma `idempotencyKey` são feitas,  
  **Quando** processadas,  
  **Então** apenas um exame deverá ser persistido.

- **Dado** que o front-end está carregando dados,  
  **Quando** houver erro de rede,  
  **Então** deve ser exibida mensagem de erro com botão "Tentar novamente".

⸻

👥 **Dependências**

- Banco de dados com suporte a transações (PostgreSQL, MySQL ou similar).
- Integração REST entre backend (Node.js/NestJS ou similar) e frontend (Angular).
- Validação de campos no front-end e back-end.
- Definição do enum de modalidades DICOM:
  - `CR, CT, DX, MG, MR, NM, OT, PT, RF, US, XA`

⸻

🧪 **Cenários de Teste**

| Cenário | Descrição | Resultado Esperado |
|--------|-----------|--------------------|
| 1 | Criar paciente com dados válidos | Paciente salvo com UUID único |
| 2 | Criar paciente com CPF já existente | Erro de validação 409 - duplicidade |
| 3 | Criar exame com paciente existente e idempotencyKey nova | HTTP 201 e exame salvo |
| 4 | Reenviar exame com mesma idempotencyKey | HTTP 200 e retorno do mesmo exame |
| 5 | Enviar múltiplas requisições simultâneas com mesma idempotencyKey | Apenas um exame persistido |
| 6 | Criar exame com paciente inexistente | Erro 400 - paciente não encontrado |
| 7 | Listar exames com paginação (10 por página) | Retorno paginado corretamente |
| 8 | Listar pacientes com paginação | Lista retornada corretamente |
| 9 | Frontend mostra loading durante chamada | Spinner visível enquanto carrega |
| 10 | Frontend exibe erro de rede e botão “Tentar novamente” | Mensagem visível e reenvio possível |
| 11 | Enviar exame com modalidade inválida | Erro 400 - enum inválido |
| 12 | Validação visual dos campos obrigatórios no formulário | Campos com feedback de erro |
| 13 | Cobertura mínima de 80% nos testes unitários e integração | Relatório de cobertura válido |

⸻

🧪 **Testes de Integração (Requisito Obrigatório)**

- Devem ser implementados utilizando ferramentas como:
  - `Supertest` ou `jest` com `NestJS TestingModule` (backend)
  - `TestBed`, `HttpClientTestingModule` (frontend Angular)
- Devem cobrir pelo menos:
  - Fluxo de criação completo (Paciente → Exame)
  - Validações de regra de negócio
  - Idempotência em requisições simultâneas
  - Respostas corretas de erro
  - Listagem paginada
⸻

# 📘 Documentação do Projeto

Esta seção detalha a implementação técnica, instruções de instalação e uso da API.

## 🚀 Tecnologias Utilizadas

- **Backend**: [NestJS](https://nestjs.com/) (Node.js)
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Linguagem**: TypeScript

## 🛠️ Configuração e Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/) rodando localmente ou via Docker

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd desafio-tecnico-III
   ```

2. **Acesse a pasta do backend**
   ```bash
   cd back
   ```

3. **Instale as dependências**
   ```bash
   npm install
   ```

4. **Configure as variáveis de ambiente**
   Crie um arquivo `.env` na raiz da pasta `back` com o seguinte conteúdo (ajuste conforme suas credenciais do banco):
   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco?schema=public"
   ```

5. **Execute as migrações do banco de dados**
   ```bash
   npx prisma migrate dev
   ```

## ▶️ Executando o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run start:dev
```

O servidor estará rodando em `http://localhost:3000`.

## 🧪 Testes

### Testes Unitários
```bash
npm run test
```

### Testes E2E (Ponta a Ponta)
```bash
npm run test:e2e
```
*Observação: Certifique-se de que o banco de dados de teste esteja acessível.*

## 📡 Documentação da API

### Pacientes

#### Criar Paciente
`POST /pacientes`

**Corpo da Requisição (JSON):**
```json
{
  "name": "Nome do Paciente",
  "document": "12345678900",
  "birthDate": "1990-01-01"
}
```

**Respostas:**
- `201 Created`: Paciente criado com sucesso.
- `409 Conflict`: Documento já cadastrado.
- `400 Bad Request`: Dados inválidos.

#### Listar Pacientes
`GET /pacientes`

**Parâmetros de Query:**
- `page` (opcional, padrão 1): Número da página.
- `pageSize` (opcional, padrão 10): Itens por página.

---

## 🖥️ Front-end

O front-end previsto para este projeto é desenvolvido em Angular e consome os endpoints do backend documentados acima.

### Tecnologias recomendadas
- Angular 18+
- RxJS
- Angular Material (opcional)

### Estrutura esperada
- Página de listagem de pacientes com paginação
- Página de listagem de exames com paginação
- Formulários de cadastro de paciente e exame com validação
- Serviços HTTP para comunicação com o backend

### Configuração do ambiente
Defina a URL base da API no arquivo de ambientes do Angular:

```ts
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000'
};
```

### Instalação e execução
Caso o front esteja em uma pasta chamada `front`:

```bash
cd front
npm install
npm run start
```

Aplicação disponível em `http://localhost:4200`.

### Integração com a API
- Pacientes:
  - GET `${apiBaseUrl}/pacientes?page=1&pageSize=10`
  - POST `${apiBaseUrl}/pacientes`
- Exames:
  - GET `${apiBaseUrl}/exam?page=1&pageSize=10`
  - POST `${apiBaseUrl}/exam`

### Testes do front
Se o projeto Angular tiver testes configurados:

```bash
npm run test
```

Para testes E2E (caso configurado com Cypress/Playwright):
```bash
npm run e2e
```

### Observações
- Caso o front não esteja neste repositório, siga os passos acima na pasta onde o projeto Angular se encontra.
- Garanta que o backend esteja rodando e acessível pelo `apiBaseUrl` configurado.

---

### Exames

#### Criar Exame
`POST /exam`

**Corpo da Requisição (JSON):**
```json
{
  "idempotencyKey": "chave-unica-do-exame",
  "patientId": "uuid-do-paciente",
  "examDate": "2023-10-25T10:00:00Z",
  "modality": "CR",
  "description": "Raio-X de Tórax"
}
```

**Modalidades Válidas:** `CR`, `CT`, `DX`, `MG`, `MR`, `NM`, `OT`, `PT`, `RF`, `US`, `XA`

**Respostas:**
- `201 Created`: Exame criado com sucesso.
- `200 OK`: Exame já existente (idempotência).
- `404 Not Found`: Paciente não encontrado.
- `400 Bad Request`: Dados inválidos.

#### Listar Exames
`GET /exam`

**Parâmetros de Query:**
- `page` (opcional, padrão 1): Número da página.
- `pageSize` (opcional, padrão 10): Itens por página.
