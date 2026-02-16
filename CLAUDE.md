# CLAUDE.md — Guia de Boas Práticas para Desenvolvimento

## Projeto

Conversor Online Multi-Formato — Serviço web para conversão de imagens entre formatos (PNG, JPG ↔ WebP, PNG, JPG) com conversão em lote, controle de qualidade e links temporários de download.

## Stack

- **Frontend:** Vite + React (JavaScript)
- **Backend:** Node.js + Fastify
- **Banco:** PostgreSQL
- **Fila:** BullMQ + Redis
- **Storage:** MinIO (S3-compatible)
- **Processamento:** Sharp (libvips)
- **Proxy:** Caddy

---

## 1. Princípios Gerais de Código

### 1.1 Nomenclatura

- Nomes descritivos e sem abreviações: `getUserById`, não `getUsrById`. `calculateTotalPrice`, não `calcTP`.
- Booleanos começam com `is/has/should/can`: `isActive`, `hasPermission`, `shouldRetry`.
- Funções descrevem ações (verbo + substantivo): `fetchUserData`, `validateFileFormat`, `createPresignedUrl`.
- Constantes em `UPPER_SNAKE_CASE`: `MAX_FILE_SIZE`, `DEFAULT_QUALITY`, `SESSION_TTL`.
- Sem prefixos redundantes: `userData` em vez de `userDataObject`. `files` em vez de `fileArray`.
- Evite nomes genéricos: `data`, `info`, `temp`, `result`, `handler` — só quando o contexto é óbvio e local.

### 1.2 Funções

- **Máximo 25 linhas por função.** Se ultrapassar, extraia subfunções.
- **Uma responsabilidade por função.** Se a descrição usa "e", provavelmente faz duas coisas.
- **Máximo 3 parâmetros.** Acima disso, use um objeto de opções com desestruturação.
- **Retorno antecipado (early return).** Valide e rejeite cedo. Evite aninhamento excessivo.
- **Sem efeitos colaterais ocultos.** Se a função altera estado externo, o nome deve refletir isso.

```javascript
// ❌ Ruim: aninhamento profundo
function process(file) {
  if (file) {
    if (file.size < MAX) {
      if (isValidFormat(file)) { /* ... */ }
    }
  }
}

// ✅ Bom: early return
function process(file) {
  if (!file) throw new Error('File required');
  if (file.size >= MAX_FILE_SIZE) throw new FileTooLargeError(file.size);
  if (!isValidFormat(file)) throw new InvalidFormatError(file.type);
  // lógica principal aqui, sem aninhamento
}
```

### 1.3 Comentários

- **Código deve ser autoexplicável.** Se precisa de comentário para explicar o QUE faz, renomeie.
- **Comente apenas o POR QUÊ, nunca o QUE.** Explique decisões não-óbvias, workarounds e trade-offs.
- **TODO com contexto:** `// TODO(fase-2): Adicionar suporte a AVIF quando Sharp atualizar`
- **Sem comentários óbvios:** `// Incrementa o contador` ← nunca.
- **JSDoc apenas em funções públicas/exportadas.** Funções internas com bons nomes dispensam documentação.

### 1.4 Tratamento de Erros

- **Nunca engolir erros silenciosamente.** Todo `catch` deve logar ou re-throw.
- **Erros custom tipados.** Criar classes de erro específicas:

```javascript
// src/errors/index.js
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class ValidationError extends AppError {
  constructor(message) { super(message, 422, 'VALIDATION_ERROR'); }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') { super(`${resource} not found`, 404, 'NOT_FOUND'); }
}

export class FileTooLargeError extends AppError {
  constructor(size) { super(`File exceeds limit (${size} bytes)`, 413, 'FILE_TOO_LARGE'); }
}

export class ConversionError extends AppError {
  constructor(message) { super(message, 500, 'CONVERSION_ERROR'); }
}
```

- **Mensagens de erro úteis com contexto:** `'File abc.png exceeds 20MB limit (got 25MB)'`, não apenas `'File too large'`.
- **Erros de validação → 4xx com mensagem clara. Erros de sistema → 5xx com log interno, sem expor detalhes ao cliente.**
- **try/catch no nível correto.** Capture onde pode agir sobre o erro. Não wrape funções inteiras em try/catch desnecessariamente.

### 1.5 Estrutura de Arquivos

- **Um export principal por arquivo.** Múltiplos exports só para helpers intimamente relacionados.
- **Máximo ~200 linhas por arquivo.** Se ultrapassar consistentemente, divida.
- **Imports organizados:** externos primeiro, depois internos, depois tipos. Separados por linha em branco.
- **Index files apenas para re-export.** Sem lógica em `index.js`.

---

## 2. Padrões de Projeto

Avaliar a necessidade caso a caso. **Não aplicar padrão onde não há problema.** Começar simples, refatorar quando a dor aparecer.

| Padrão | Quando Usar | Exemplo no Projeto |
|--------|-------------|-------------------|
| **Repository** | Isolar acesso a dados. Permite trocar DB sem alterar services. | `jobRepository.create()`, `jobRepository.findById()` |
| **Service Layer** | Lógica de negócio que orquestra múltiplas operações. | `jobService.startProcessing()` chama repo + bullmq + minio |
| **Strategy** | Mesma operação com múltiplas implementações em runtime. | Conversão: WebP, PNG, JPG são strategies do mesmo contrato |
| **Factory** | Criar objetos complexos com validação. | `createConversionOptions(preset)` retorna options validadas |
| **Observer/Events** | Desacoplar produtor de consumidor. | Worker emite `file:converted`, listeners atualizam Postgres |
| **Middleware** | Lógica transversal (auth, logging, validation). | Fastify hooks: `validateSession`, `rateLimit`, `logRequest` |

> **Regra de ouro:** Padrões são refatorações, não ponto de partida. Comece com a solução mais simples. Se surgir duplicação, acoplamento ou dificuldade de teste, ENTÃO extraia para o padrão apropriado.

---

## 3. Frontend — React

O frontend deve seguir o modelo mental do React rigorosamente. Usar exclusivamente os recursos que o React provê para gerenciamento de estado, efeitos colaterais e renderização.

### 3.1 PROIBIDO

- ❌ Manipulação direta de DOM (`document.getElementById`, `document.querySelector`, `innerHTML`)
- ❌ `localStorage` ou `sessionStorage` para estado da aplicação
- ❌ Variáveis globais fora do React (`window.myState = ...`)
- ❌ jQuery ou qualquer lib que manipule DOM diretamente
- ❌ Event listeners manuais (`addEventListener`) sem cleanup em `useEffect`
- ❌ Mutação direta de state (`state.items.push(x)` em vez de `setItems([...items, x])`)
- ❌ `dangerouslySetInnerHTML`
- ❌ Class components
- ❌ Index como key em listas que mudam

### 3.2 OBRIGATÓRIO

- ✅ `useState` / `useReducer` para todo estado local
- ✅ React Context para estado compartilhado entre componentes
- ✅ `useEffect` para efeitos colaterais (fetch, subscriptions, timers)
- ✅ Cleanup em `useEffect` quando criar subscriptions/timers
- ✅ Cookies (httpOnly via API) para autenticação/sessão
- ✅ Composição de componentes em vez de herança
- ✅ Keys estáveis e únicas em listas
- ✅ Componentes funcionais apenas
- ✅ Um componente por arquivo (nome do arquivo = nome do componente)
- ✅ Desestruturação de props: `({ files, onUpload, isLoading })` em vez de `(props)`

### 3.3 Hierarquia de Componentes

| Tipo | Responsabilidade | Contém Estado? | Exemplo |
|------|-----------------|----------------|---------|
| **Page** | Composição de seções e layout | Mínimo | `ConverterPage` |
| **Container** | Lógica, fetch de dados, orquestração | Sim | `UploadContainer`, `JobStatusContainer` |
| **Component (UI)** | Renderização visual pura | Local apenas | `FileCard`, `QualitySlider`, `FormatSelector` |
| **Hook customizado** | Lógica reutilizável extraída | Sim | `useJob`, `useUpload`, `usePolling` |

### 3.4 Gerenciamento de Estado

| Escopo | Ferramenta | Quando |
|--------|-----------|--------|
| Local do componente | `useState` | Toggle, input value, loading flag, UI-only state |
| Local complexo | `useReducer` | Múltiplas ações relacionadas (upload com progresso + erro + retry) |
| Compartilhado | React Context + `useReducer` | Job atual, configurações de conversão, session info |
| Servidor/async | Custom hooks com fetch | Status do job, lista de arquivos, download URLs |

### 3.5 Regras de Componentes

- Máximo **150 linhas** por componente. Se ultrapassar, extrair hooks ou subcomponentes.
- Sem lógica de negócio no JSX — extraia para variáveis ou hooks antes do `return`.
- Memoização consciente: `useMemo` e `useCallback` apenas quando há custo mensurável. Não memoizar tudo por padrão.
- Evitar prop drilling acima de 2 níveis — usar Context ou composição.
- Props tipadas com PropTypes para todo componente exportado.

### 3.6 Estrutura de Pastas (Frontend)

```
src/
├─ pages/                # Componentes de página (1 por rota)
│  └─ ConverterPage.jsx
├─ components/           # Componentes reutilizáveis de UI
│  ├─ FileDropzone.jsx
│  ├─ FileCard.jsx
│  ├─ QualitySlider.jsx
│  └─ FormatSelector.jsx
├─ containers/           # Componentes com lógica/estado
│  ├─ UploadContainer.jsx
│  └─ JobStatusContainer.jsx
├─ hooks/                # Custom hooks
│  ├─ useJob.js
│  ├─ useUpload.js
│  └─ usePolling.js
├─ contexts/             # React Contexts
│  └─ JobContext.jsx
├─ services/             # Chamadas à API (fetch wrappers)
│  └─ api.js
├─ utils/                # Funções puras utilitárias
│  ├─ formatBytes.js
│  └─ validateFile.js
├─ constants/            # Constantes e configurações
│  └─ index.js
└─ styles/               # CSS / Tailwind config
```

---

## 3.7 Design System — Vecta

Todos os componentes do frontend devem seguir este design system. Referência completa em `/design-system.md`.

### CSS Variables

```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border-top: rgba(255, 255, 255, 0.3);
  --glass-border-bottom: rgba(255, 255, 255, 0.05);
  --text-main: #f5f5f7;
  --nav-height: 60px;
}
```

### Cores

**Primary (Azul):** `primary-600: #0284c7` (cor principal de acento). Escala de 50 (`#f0f9ff`) a 950 (`#082f49`).

**Neutrals:** `neutral-950: #020617` (background base). Escala de 50 (`#f8fafc`) a 950.

**Gradiente CTA:** `linear-gradient(to right, #3dbff2, #020f59)`

**Texto (dark theme):** heading `text-white` | body `text-neutral-300` | secondary `text-neutral-400` | muted `text-neutral-500`

### Tipografia

Font stack: `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`

Google Font: `Inter` (weights: 300, 400, 500, 600, 700)

| Elemento | Mobile | Desktop | Weight | Line-height |
|----------|--------|---------|--------|-------------|
| Hero H1 | `text-4xl` (36px) | `text-7xl` (56px) | 900 | `leading-[0.95]` |
| Section H2 | `text-3xl` (30px) | `text-4xl` (36px) | 700 | default |
| Subsection H3 | `text-xl` (20px) | `text-2xl` (24px) | 600 | default |
| Body Large | `text-lg` (18px) | `text-xl` (20px) | 400 | `leading-relaxed` |
| Body | `text-base` (16px) | `text-base` (16px) | 400 | `leading-relaxed` |
| Small | `text-sm` (14px) | `text-sm` (14px) | 500 | default |
| Label/Tag | `text-xs` (12px) | `text-xs` (12px) | 600 | `tracking-wider`, `uppercase` |

### Border Radius

| Classe | Uso |
|--------|-----|
| `rounded-full` | Botões, navbar, pills, badges |
| `rounded-3xl` (24px) | Containers grandes, modais mobile |
| `rounded-2xl` (16px) | **Cards padrão**, glass boxes, imagens hero |
| `rounded-xl` (12px) | Imagens de galeria, carrossel items |
| `rounded-lg` (8px) | Elementos menores |

### Sombras

```css
/* Glow de botão primário (hover) */
box-shadow: 0 0 20px rgba(2, 132, 199, 0.5);

/* Glow de card (hover) */
box-shadow: 0 0 30px rgba(14, 165, 233, 0.15);
```

### Liquid Glass (Efeito Vidro)

Classe `.liquid-glass` para navbar e componentes sobre fundo escuro. Usa `backdrop-filter: blur()` com pseudo-elements. Ver detalhes completos em `/design-system.md` seção 7.

### Componentes Padrão

**Button** — Variants: `primary` | `secondary` | `outline`. Sizes: `sm` | `md` | `lg`. Sempre `rounded-full`.

```
primary:   bg-primary-600, hover:bg-primary-500, hover:shadow-glow, text-white
secondary: bg-primary-900/30, hover:bg-primary-900/50, text-primary-300
outline:   border-neutral-700, hover:bg-neutral-800, text-neutral-200
```

**CTA Button:** `bg-gradient-to-r from-[#3dbff2] to-[#020f59]`, `rounded-full`, `hover:scale-105`

**Card:** `rounded-2xl`, `border border-neutral-800`, `hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]`, `hover:scale-[1.03]`

**Service Card:** `.liquid-glass rounded-2xl`, `hover:border-primary-500/50`, `hover:-translate-y-2`

**Badge/Tag:** `text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full`

### Transições

| Duração | Uso |
|---------|-----|
| `duration-200` | Interações rápidas (botões, toggles) |
| `duration-300` | **Padrão geral** (hover, borders) |
| `duration-500` | Hover de imagens, scale |
| `duration-700` | Slide de carrossel |

### Breakpoints

| Prefixo | Largura | Dispositivo |
|---------|---------|-------------|
| (base) | 0px | Mobile |
| `sm:` | 640px | Tablet portrait |
| `md:` | 768px | Tablet landscape |
| `lg:` | 1024px | Desktop |

### Z-Index Scale

| Valor | Uso |
|-------|-----|
| `z-[100]` | Lightbox / modais fullscreen |
| `z-50` | Navbar fixo |
| `z-40` | Overlay do menu mobile |
| `z-10` | Conteúdo relativo sobre imagens |
| `-z-10` | Camadas de glass backdrop |

### Ícones

Biblioteca: **Lucide React** (`lucide-react`). Ícones comuns: `ArrowLeft`, `ArrowRight`, `X`, `Check`, `ChevronLeft`, `ChevronRight`, `Monitor`, `Star`, `Menu`, `ExternalLink`.

---

## 4. Backend — Node.js / Fastify

### 4.1 Arquitetura de Camadas

Cada camada só conhece a camada imediatamente abaixo:

```
Routes → Controllers → Services → Repositories / Queue / Storage
```

| Camada | Responsabilidade | Conhece |
|--------|-----------------|---------|
| **Routes** | Definir endpoints, extrair params, chamar controller | Controllers |
| **Controllers** | Validar request, chamar service, formatar response | Services |
| **Services** | Lógica de negócio, orquestração | Repositories, Queue, Storage |
| **Repositories** | Acesso a dados (Postgres) | Banco de dados |
| **Queue** | Enfileirar/consumir jobs (BullMQ) | Redis |
| **Storage** | Upload/download de arquivos (MinIO) | Object storage |

### 4.2 Estrutura de Pastas (Backend)

```
src/
├─ routes/               # Definição de rotas Fastify
│  └─ jobRoutes.js
├─ controllers/          # Validação de request/response
│  └─ jobController.js
├─ services/             # Lógica de negócio
│  ├─ jobService.js
│  └─ conversionService.js
├─ repositories/         # Acesso a dados
│  ├─ jobRepository.js
│  └─ jobFileRepository.js
├─ workers/              # Consumers do BullMQ
│  └─ conversionWorker.js
├─ queue/                # Configuração de filas
│  └─ conversionQueue.js
├─ storage/              # Wrapper do MinIO/S3
│  └─ objectStorage.js
├─ middleware/            # Fastify hooks/plugins
│  ├─ session.js
│  ├─ rateLimit.js
│  └─ errorHandler.js
├─ errors/               # Classes de erro customizadas
│  └─ index.js
├─ config/               # Configurações e variáveis de ambiente
│  └─ index.js
├─ utils/                # Funções utilitárias puras
├─ db/                   # Migrations e conexão
│  ├─ migrations/
│  └─ connection.js
└─ app.js                # Bootstrap do Fastify
```

### 4.3 Regras de API

- **JSON Schema para toda rota.** Usar o schema nativo do Fastify para validação automática de request/response.
- **Respostas consistentes:**

```javascript
// Sucesso
{ "success": true, "data": { ... } }

// Erro
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

- **HTTP status codes corretos:** 201 para criação, 404 para não encontrado, 422 para validação, 429 para rate limit, 413 para arquivo grande demais.
- **Sem lógica de negócio nas rotas.** Rotas extraem params e delegam para controllers.

### 4.4 Configuração e Ambiente

- **Todas as configs via variáveis de ambiente.** Sem valores hardcoded no código.
- **Arquivo `config/index.js` centralizado:** um único ponto que lê `process.env` e exporta valores tipados com defaults.
- **Validar configs no boot:** se uma env obrigatória está ausente, falhar imediatamente com mensagem clara.
- **`.env.example` no repositório:** documenta todas as variáveis necessárias com valores de exemplo.

```javascript
// src/config/index.js
const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: requireEnv('DATABASE_URL'),
  },
  redis: {
    url: requireEnv('REDIS_URL'),
  },
  minio: {
    endpoint: requireEnv('MINIO_ENDPOINT'),
    accessKey: requireEnv('MINIO_ACCESS_KEY'),
    secretKey: requireEnv('MINIO_SECRET_KEY'),
    bucket: process.env.MINIO_BUCKET || 'converter',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 20 * 1024 * 1024,
    maxFilesPerJob: parseInt(process.env.MAX_FILES_PER_JOB, 10) || 20,
  },
  session: {
    ttl: parseInt(process.env.SESSION_TTL, 10) || 7200, // 2h em segundos
  },
  conversion: {
    defaultQuality: parseInt(process.env.DEFAULT_QUALITY, 10) || 82,
    timeout: parseInt(process.env.CONVERSION_TIMEOUT, 10) || 30000,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY, 10) || 4,
  },
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

export default config;
```

---

## 5. Banco de Dados

### 5.0 Schema do Banco de Dados

**Enums**

| Enum | Valores |
|------|---------|
| `job_status` | `pending`, `processing`, `completed`, `failed` |
| `file_status` | `pending`, `processing`, `completed`, `failed` |

**Tabela `jobs`**

| Coluna | Tipo |
|--------|------|
| `id` | UUID (PK) |
| `session_token` | VARCHAR |
| `status` | job_status |
| `output_format` | image_format |
| `quality` | INTEGER |
| `total_files` | INTEGER |
| `completed_files` | INTEGER |
| `failed_files` | INTEGER |
| `created_at` | TIMESTAMPTZ |
| `updated_at` | TIMESTAMPTZ |
| `expires_at` | TIMESTAMPTZ |

**Tabela `job_files`**

| Coluna | Tipo |
|--------|------|
| `id` | UUID (PK) |
| `job_id` | UUID (FK → jobs) |
| `original_name` | VARCHAR |
| `original_key` | VARCHAR |
| `original_size` | BIGINT |
| `original_format` | image_format |
| `converted_key` | VARCHAR |
| `converted_size` | BIGINT |
| `status` | file_status |
| `error_message` | TEXT |
| `created_at` | TIMESTAMPTZ |
| `updated_at` | TIMESTAMPTZ |

> **IMPORTANTE:** Sempre usar estes nomes exatos de colunas e valores de enum. Nunca usar: `done`, `error`, `done_with_errors`, `expired`, `input_key`, `output_key`, `output_mime`, `savings_percent`.

### 5.1 Migrations

- **Toda alteração de schema via migration.** Nunca alterar banco manualmente.
- **Migrations idempotentes:** rodar duas vezes não deve quebrar.
- **Nomes descritivos:** `001_create_jobs_table.sql`, `002_add_session_token_to_jobs.sql`
- **Cada migration faz UMA coisa:** criar tabela OU adicionar coluna, nunca ambos.

### 5.2 Queries

- **Queries parametrizadas sempre.** Sem string concatenation. Usar placeholders (`$1`, `$2`).
- **Queries no repository, nunca no service.** Services chamam métodos do repository, não escrevem SQL.
- **Índices para campos de busca:** `session_token`, `status`, `expires_at`, `job_id` em `job_files`.
- **Transactions quando necessário:** operações que alteram múltiplas tabelas devem ser atômicas.

```javascript
// ❌ Ruim: SQL concatenado
const result = await db.query(`SELECT * FROM jobs WHERE id = '${jobId}'`);

// ✅ Bom: parametrizado
const result = await db.query('SELECT * FROM jobs WHERE id = $1', [jobId]);
```

---

## 6. Segurança

Aplicar automaticamente, sem precisar ser lembrado:

| Regra | Implementação |
|-------|--------------|
| Sem secrets no código | Tudo via `process.env`. Nunca commitar `.env` real. |
| Input validation | JSON Schema no Fastify para toda rota. Validar tipo, range, formato. |
| File validation | Verificar MIME type real (não confiar na extensão). Decodificar com Sharp. |
| SQL injection | Queries parametrizadas sempre. Nunca concatenar strings em SQL. |
| XSS | React já escapa por padrão. Nunca usar `dangerouslySetInnerHTML`. |
| CORS | Aceitar apenas o domínio do frontend. Sem wildcard (`*`) em produção. |
| Rate limiting | Por IP no proxy + por session na API. |
| Cookies | `httpOnly`, `secure`, `sameSite: 'strict'`. Sem dados sensíveis além do token. |
| Headers de segurança | `@fastify/helmet`: X-Content-Type-Options, X-Frame-Options, etc. |
| Presigned URLs | Expiração curta (1h). Não reutilizáveis. |

---

## 7. Docker e Infraestrutura

- **Multi-stage build:** imagem de build (com devDependencies) separada da imagem de produção.
- **Imagens alpine:** `node:20-alpine` como base. Menor superfície de ataque.
- **Non-root user:** rodar processo como usuário não-root no container.
- **Health checks:** cada serviço com endpoint `/health` que verifica dependências.
- **`.dockerignore`:** excluir `node_modules`, `.env`, `.git`, `logs`.
- **Variáveis de ambiente:** definidas no `docker-compose.yml` ou `.env` file. Nunca no Dockerfile.
- **Volumes nomeados:** para Postgres, Redis e MinIO. Nunca bind mount em produção.

---

## 8. Processo de Desenvolvimento

### 8.1 Antes de Codar

1. Ler este CLAUDE.md e entender o contexto completo.
2. Analisar a estrutura existente antes de criar novos arquivos. Respeitar padrões já estabelecidos.
3. Perguntar se houver ambiguidade. Não assumir. Melhor perguntar do que refazer.
4. Planejar antes de executar. Para tarefas complexas, descrever o plano antes de escrever código.

### 8.2 Durante o Desenvolvimento

1. Implementar incrementalmente. Uma funcionalidade por vez. Testar antes de seguir.
2. Preservar código existente que funciona. Não refatorar o que não foi pedido.
3. Criar arquivos pequenos e focados. Resistir a criar "super arquivos".
4. Rodar o que construiu. Sempre testar (`npm run dev`, executar endpoint) antes de declarar pronto.
5. Commitar logicamente. Um commit por funcionalidade/fix.

### 8.3 Commits

Seguir Conventional Commits:

| Prefixo | Quando | Exemplo |
|---------|--------|---------|
| `feat:` | Nova funcionalidade | `feat: add presigned upload URL generation` |
| `fix:` | Correção de bug | `fix: handle alpha channel in JPG conversion` |
| `refactor:` | Reestruturação sem mudar comportamento | `refactor: extract conversion logic to service layer` |
| `chore:` | Configs, deps, infra | `chore: add redis service to docker-compose` |
| `docs:` | Documentação | `docs: update API endpoints in README` |

### 8.4 Testes

- Testar o **caminho feliz + pelo menos 1 caso de erro** para cada endpoint/função crítica.
- Testes unitários para services e utils. Funções puras são fáceis de testar.
- Testes de integração para rotas críticas: `POST /api/jobs`, `POST /api/jobs/:id/start`.
- Nomeação: `describe('jobService') > it('should create job with valid parameters')`
- Sem dependência de estado externo. Cada teste deve rodar isolado.

---

## 9. Anti-padrões a Evitar

| Anti-padrão | Problema | Alternativa |
|------------|----------|-------------|
| God Component | Componente React com 500+ linhas | Dividir em container + componentes menores + hooks |
| Prop Drilling (3+ níveis) | Props passadas por componentes que não as usam | React Context ou composição |
| useEffect para tudo | Lógica de negócio dentro de useEffect | Extrair para custom hooks ou funções puras |
| Catch vazio | `try { } catch { }` sem tratamento | Logar, re-throw, ou retornar erro tipado |
| Magic numbers | `if (file.size > 20971520)` | `const MAX_FILE_SIZE = 20 * 1024 * 1024` |
| Console.log em produção | Logs não-estruturados | Logger estruturado (pino) com níveis |
| Fetch sem loading/error | Chamada API sem indicar loading ou tratar erro | Hook com `{ data, loading, error }` |
| SQL concatenado | `'SELECT * FROM jobs WHERE id = ' + id` | Sempre usar `$1`, `$2` parametrizado |
| Import circular | A importa B que importa A | Reorganizar dependências ou extrair para terceiro módulo |
| Over-engineering | Padrões complexos para problemas simples | Começar simples, refatorar quando necessário |

---

## 10. Checklist por Funcionalidade

Antes de considerar qualquer funcionalidade como pronta:

- [ ] **Nomenclatura:** nomes descritivos? Sem abreviações? Padrão consistente com o resto do projeto?
- [ ] **Tamanho:** funções < 25 linhas? Arquivos < 200 linhas? Componentes < 150 linhas?
- [ ] **Erros:** todos os caminhos de erro tratados? Mensagens claras com contexto?
- [ ] **Validação:** inputs validados na borda (API)? Tipos corretos?
- [ ] **Estado (React):** usando useState/useReducer/Context? Sem localStorage? Sem DOM direto?
- [ ] **Segurança:** sem secrets hardcoded? Queries parametrizadas? CORS correto?
- [ ] **Testes:** caminho feliz testado? Pelo menos 1 caso de erro?
- [ ] **Commit:** mensagem conventional? Mudança atômica?
