# Conversor Online Multi-Formato

Serviço web para conversao de imagens entre formatos (PNG, JPG, WebP) com conversao em lote, controle de qualidade e links temporarios de download.

O usuario faz upload de ate 20 imagens, escolhe formato de saida e qualidade, e recebe links de download temporarios apos a conversao.

<!-- Adicione um screenshot ou gif aqui -->
<!-- ![Demo](docs/demo.gif) -->

---

## Stack Tecnologica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite |
| Backend / API | Node.js + Fastify |
| Fila de processamento | BullMQ + Redis |
| Banco de dados | PostgreSQL 16 |
| Object storage | MinIO (S3-compatible) |
| Processamento de imagem | Sharp (libvips) |
| Reverse proxy | Caddy |
| Containerizacao | Docker + Docker Compose |

---

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) >= 20.10
- [Docker Compose](https://docs.docker.com/compose/install/) >= 2.0

---

## Quick Start

```bash
# 1. Clone o repositorio
git clone https://github.com/seu-usuario/conversor-online.git
cd conversor-online

# 2. Copie e configure as variaveis de ambiente
cp .env.example .env

# 3. Edite o .env com senhas seguras (troque todos os CHANGE_ME)
#    - POSTGRES_PASSWORD
#    - MINIO_ACCESS_KEY / MINIO_SECRET_KEY
#    - COOKIE_SECRET
#    Atualize tambem DATABASE_URL com a senha escolhida

# 4. Suba todos os servicos
docker compose up -d

# 5. Acesse a aplicacao
#    http://localhost:8080
```

Na primeira execucao, os containers `migrate` e `minio-init` rodam automaticamente para criar as tabelas do banco e o bucket do MinIO.

---

## Variaveis de Ambiente

### Backend

| Variavel | Descricao | Default |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente (`development` / `production`) | `development` |
| `PORT` | Porta da API | `3000` |
| `LOG_LEVEL` | Nivel de log (`debug`, `info`, `warn`, `error`) | `info` |

### PostgreSQL

| Variavel | Descricao | Default |
|----------|-----------|---------|
| `POSTGRES_USER` | Usuario do banco | - |
| `POSTGRES_PASSWORD` | Senha do banco | - |
| `POSTGRES_DB` | Nome do banco | - |
| `DATABASE_URL` | Connection string completa | - |
| `DB_POOL_MIN` | Conexoes minimas no pool | `2` |
| `DB_POOL_MAX` | Conexoes maximas no pool | `10` |
| `DB_STATEMENT_TIMEOUT` | Timeout de queries (ms) | `10000` |

### Redis

| Variavel | Descricao | Default |
|----------|-----------|---------|
| `REDIS_URL` | URL de conexao do Redis | - |

### MinIO (Object Storage)

| Variavel | Descricao | Default |
|----------|-----------|---------|
| `MINIO_ENDPOINT` | Hostname do MinIO | - |
| `MINIO_PORT` | Porta do MinIO | `9000` |
| `MINIO_ACCESS_KEY` | Access key | - |
| `MINIO_SECRET_KEY` | Secret key | - |
| `MINIO_BUCKET` | Nome do bucket | `converter` |
| `MINIO_USE_SSL` | Usar HTTPS no MinIO | `false` |
| `MINIO_PUBLIC_URL` | URL publica para presigned URLs | `http://localhost/storage` |
| `PRESIGNED_URL_EXPIRY` | Expiracao das URLs assinadas (s) | `3600` |

### Upload e Conversao

| Variavel | Descricao | Default |
|----------|-----------|---------|
| `MAX_FILE_SIZE` | Tamanho maximo por arquivo (bytes) | `20971520` (20 MB) |
| `MAX_FILES_PER_JOB` | Maximo de arquivos por job | `20` |
| `MAX_TOTAL_JOB_SIZE` | Tamanho total maximo por job (bytes) | `104857600` (100 MB) |
| `DEFAULT_QUALITY` | Qualidade padrao de conversao (1-100) | `82` |
| `CONVERSION_TIMEOUT` | Timeout de conversao por arquivo (ms) | `30000` |
| `WORKER_CONCURRENCY` | Conversoes simultaneas no worker | `cpus - 1` |

### Sessao e Seguranca

| Variavel | Descricao | Default |
|----------|-----------|---------|
| `SESSION_TTL` | Duracao da sessao (s) | `7200` (2h) |
| `COOKIE_SECRET` | Segredo para assinatura de cookies | - |
| `ALLOWED_ORIGINS` | Origens permitidas pelo CORS (separadas por virgula) | `http://localhost:5173` |

---

## Arquitetura

```
                        :8080
                          |
                       [Caddy]
                      /   |   \
                    /     |     \
     /api/*      /  /storage/*   \  /*
               /        |         \
          [API]      [MinIO]    [Frontend]
          :3000       :9000      (nginx)
           |            |
      +---------+       |
      |         |       |
   [Postgres] [Redis]   |
              (BullMQ)  |
                  |     |
               [Worker]-+
               (Sharp)
```

**Fluxo de conversao:**

1. Frontend envia metadados dos arquivos para `POST /api/jobs`
2. API cria o job no Postgres e retorna presigned upload URLs
3. Frontend faz upload direto para o MinIO via presigned URLs
4. Frontend chama `POST /api/jobs/:id/start` para iniciar o processamento
5. API enfileira o job no BullMQ (Redis)
6. Worker consome a fila, baixa do MinIO, converte com Sharp, faz upload do resultado
7. Frontend faz polling em `GET /api/jobs/:id` ate o job completar
8. Frontend usa `GET /api/jobs/:id/download/:fileId` para obter URL de download

---

## Endpoints da API

Todos os endpoints estao sob o prefixo `/api/jobs`.

### `POST /api/jobs` — Criar job

Cria um novo job de conversao e retorna presigned URLs para upload.

**Body:**
```json
{
  "files": [
    { "name": "foto.png", "size": 1024000, "type": "image/png" }
  ],
  "outputFormat": "webp",
  "quality": 82
}
```

**Resposta (201):**
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "uploadUrls": { "foto.png": "https://..." }
  }
}
```

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| `files` | array | sim | Lista de arquivos (1-20) |
| `files[].name` | string | sim | Nome do arquivo (max 255 chars) |
| `files[].size` | integer | sim | Tamanho em bytes |
| `files[].type` | string | sim | `image/png` ou `image/jpeg` |
| `outputFormat` | string | sim | `webp`, `jpg` ou `png` |
| `quality` | integer | nao | Qualidade 1-100 (default: 82) |

Rate limit: 10 req/min

---

### `POST /api/jobs/:id/start` — Iniciar processamento

Inicia a conversao apos todos os uploads serem concluidos.

**Resposta (200):**
```json
{
  "success": true,
  "data": { "message": "Processing started" }
}
```

Rate limit: 20 req/min

---

### `GET /api/jobs/:id` — Status do job

Retorna o status do job e de cada arquivo.

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "uuid",
      "status": "completed",
      "output_format": "webp",
      "quality": 82,
      "total_files": 3,
      "completed_files": 3,
      "failed_files": 0
    },
    "files": [
      {
        "id": "uuid",
        "original_name": "foto.png",
        "original_size": 1024000,
        "status": "completed",
        "converted_size": 512000
      }
    ]
  }
}
```

Status possiveis: `pending`, `processing`, `completed`, `failed`

Rate limit: 60 req/min

---

### `GET /api/jobs/:id/download/:fileId` — URL de download

Retorna uma presigned URL temporaria para download do arquivo convertido.

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://...",
    "fileName": "foto.webp"
  }
}
```

Rate limit: 30 req/min

---

### `GET /health` — Health check

Verifica o status de todos os servicos.

**Resposta (200):**
```json
{
  "status": "ok",
  "services": {
    "database": true,
    "redis": true,
    "storage": true
  },
  "uptime": 3600,
  "version": "0.1.0"
}
```

---

## Desenvolvimento Local

### Sem Docker (backend apenas)

```bash
# Instalar dependencias
cd backend && npm install

# Subir dependencias (Postgres, Redis, MinIO)
docker compose up -d postgres redis minio minio-init migrate

# Rodar a API
npm run dev

# Em outro terminal, rodar o worker
npm run dev:worker
```

```bash
# Frontend
cd frontend && npm install
npm run dev
```

O frontend roda em `http://localhost:5173` e a API em `http://localhost:3000`.

### Logs

```bash
# Todos os servicos
docker compose logs -f

# Apenas API
docker compose logs -f api

# Apenas worker
docker compose logs -f worker
```

### MinIO Console

Acessivel em `http://localhost:9001` para inspecionar o bucket e os arquivos armazenados.

---

## Deploy em Producao

### Com dominio e SSL (Caddy)

1. Atualize o `caddy/Caddyfile` para usar seu dominio:

```caddyfile
seu-dominio.com {
    handle /api/* {
        reverse_proxy api:3000
    }

    handle /storage/* {
        uri strip_prefix /storage
        reverse_proxy minio:9000 {
            header_up Host minio:9000
        }
    }

    handle {
        reverse_proxy frontend:80
    }
}
```

O Caddy obtem e renova certificados SSL automaticamente via Let's Encrypt.

2. Remova o bloco `auto_https off` do topo do Caddyfile.

3. Atualize o `.env`:

```env
NODE_ENV=production
ALLOWED_ORIGINS=https://seu-dominio.com
MINIO_PUBLIC_URL=https://seu-dominio.com/storage
```

4. Atualize a porta do Caddy no `docker-compose.yml`:

```yaml
ports:
  - "80:80"
  - "443:443"
```

5. Suba os servicos:

```bash
docker compose up -d
```

### Checklist de producao

- [ ] Trocar todas as senhas (`CHANGE_ME`) por valores seguros
- [ ] Definir `NODE_ENV=production`
- [ ] Configurar `ALLOWED_ORIGINS` com o dominio real
- [ ] Configurar `MINIO_PUBLIC_URL` com a URL publica
- [ ] Gerar um `COOKIE_SECRET` forte (`openssl rand -hex 32`)
- [ ] Ajustar `WORKER_CONCURRENCY` para o hardware disponivel
- [ ] Configurar backup do volume `postgres_data`
- [ ] Monitorar o endpoint `/health`

---

## Licenca

MIT
