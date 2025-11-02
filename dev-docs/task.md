## 3. TASK.MD - BACKLOG TÉCNICO

### Épica 1: Infraestructura Base (3.6 dev-weeks)

**US-001: Setup PostgreSQL Database**

- PostgreSQL 16 deployed (Docker Compose / RDS) 
- Schema migrations (Flyway/node-pg-migrate)
- Tables: users, projects, tasks, commits, files, file_metrics
- Connection pool (max 20 connections)
- Backup automático diario

**US-002: API Gateway Node.js/Express**

- Express + TypeScript
- REST endpoints: `/api/v1/projects`, `/api/v1/tasks`, `/api/v1/commits`
- GraphQL endpoint `/graphql` (Apollo Server)
- Rate limiting: 100 req/min per user 
- OpenAPI/Swagger docs

**US-003: Autenticación JWT + RBAC**

- JWT tokens (access 1h, refresh 7d)
- Roles: Admin, Developer, Analyst, Viewer
- Middleware authorization
- Password hash bcrypt (cost 12)
- OAuth2 stub (Keycloak)

### Épica 2: Git Mining Service (7.2 dev-weeks)

**US-010: simple-git Integration**

- Clone repos HTTPS/SSH
- Extract commit history (hash, author, date, message)
- Parse branch topology
- Fetch diffs por commit
- Handle repos 100K commits \u003c30s
- Error handling: rate limits, network  

**US-011: Commit→Task Linking**

- Regex parsing: `PROJ-123`, `#456`, `fixes JIRA-789` 
- Store mappings PostgreSQL (task_commits table)
- Bulk insert 1000+ commits performante
- API: `/api/commits/:sha/tasks`, `/api/tasks/:id/commits`

**US-012: Hotspot Analysis Engine**

- Calcular churn: `git log --name-only --since` 
- Integrar escomplex para complexity  
- Score: `churn_count × complexity` 
- Store file_metrics table
- API: `/api/hotspots?since=90d&limit=20`

**US-013: Caching & Incremental Analysis**

- PostgreSQL cache: último commit analizado
- Delta processing: solo nuevos commits
- Background jobs (Bull/BullMQ)
- Progress tracking

### Épica 3: Git GUI Superior (8.4 dev-weeks)

**US-020: Commit Graph Visualization**

- React + Cytoscape.js force-directed layout 
- Nodes: commits (color por branch)
- Edges: parent relationships
- Click → details panel
- Zoom, pan, search por SHA
- Performance: 10K commits \u003c2s

**US-021: Ticket Integration Inline**

- Commit node badge: ticket count
- Sidebar: ticket details on click
- Tooltip hover: “JIRA-123: Add auth”
- Link to Jira (new tab)
- Filter: “Show only JIRA-123 commits”

**US-022: Interactive Filters**

- Date range picker
- Author multi-select
- Branch filter checkboxes
- Ticket ID search
- Apply filters → re-render \u003c500ms

### Épica 4: Análisis Hotspots (3.6 dev-weeks)

**US-030: Heatmap Visualization**

- React + ECharts heatmap
- Tooltip: filename, churn, complexity, score
- Click cell → file detail
- Export PNG

**US-031: Hotspot Detail View**

- File breadcrumb navigation
- Change history timeline (90 días)
- Contributors list (top 5)
- Complexity trend chart
- Code snippet preview (50 líneas syntax highlight)

### Épica 5: Vista Task→Commits (4.8 dev-weeks)

**US-040: Jira API Integration**

- OAuth2 flow o API token  
- Fetch projects, issues
- Sync to PostgreSQL (incremental)
- Webhook `/webhooks/jira` real-time  
- Rate limit handling (10 req/sec) 

**US-041: GitHub/GitLab API Integration**

- GitHub: @octokit/rest para commits, PRs 
- GitLab: @gitbeaker/node para pipelines  
- Webhook `/webhooks/github` push events 
- HMAC signature verification 

**US-042: Task→Commits Timeline UI**

- React + d3-milestones
- Timeline horizontal: created → commits → merged
- Swimlanes por branch
- Click commit → diff view

### Épica 6: Testing & QA (3.6 dev-weeks)

**US-050: Unit Tests**

- Jest configurado
- Coverage \u003e80% services
- Mocks: simple-git, API clients

**US-051: Integration Tests**

- Testcontainers PostgreSQL
- API endpoint tests (Supertest)
- GraphQL query tests

**US-052: E2E Tests**

- Playwright configurado
- Critical path: Login → View project → Click commit → See ticket

### Épica 7: Documentación (1.8 dev-weeks)

**US-060: Technical Documentation**

- Architecture diagrams (draw.io)
- API docs (OpenAPI Swagger)
- DB schema ER diagram
- Deployment guide (Docker Compose, K8s)

**US-061: User Documentation**

- User guide con screenshots
- Video tutorial: “First 5 minutes”
- FAQ

-----

## 4. MATRICES COMPARATIVAS

### Matriz 1: ClickHouse vs Elasticsearch vs Alternativas

|Criterio                  |ClickHouse       |Elasticsearch  |TimescaleDB    |VictoriaMetrics|
|--------------------------|-----------------|---------------|---------------|---------------|
|**Query latency 10B rows**|6.6s             |33s            |25s+           |N/A (metrics)  |
|**Write throughput**      |2.2M/s           |330K-1.2M/s    |480K/s         |2.2M samples/s |
|**Compresión 10B rows**   |42GB             |513GB          |350GB          |3GB (4M series)|
|**High-cardinality**      |✅ Sin degradación|❌ -72%         |⚠️ Moderado     |✅ Excelente    |
|**Costo infra (50 users)**|~$600/mes        |~$1,600/mes    |~$800/mes      |~$400/mes      |
|**SQL support**           |✅ Full           |⚠️ ESQL limited |✅ Full         |❌ PromQL only  |
|**Full-text search**      |⚠️ Via ngram      |✅ Excellent    |⚠️ Via trigram  |❌              |
|**Managed services**      |ClickHouse Cloud |Elastic Cloud  |Timescale Cloud|VM Cloud       |
|**GitHub stars**          |37K+             |69K+           |17K+           |12K+           |
|**RECOMENDACIÓN**         |**PRIMARIA**     |Log search only|No recomendado |Solo metrics   |

**Decisión**: ClickHouse primaria; Elasticsearch opcional solo si log search UI crítico.

### Matriz 2: Librerías Minería Git Node.js

|isomorphic-git                                                              |PyDriller (IPC)     |
|----------------------------|------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------|--------------------|
|536K                                                                        |N/A Python          |
|**GitHub stars**            |3,714 [![isomorphic-git vs nodegit vs simple-git|npm trends](claude-citation:/icon.png?validation=D9BD68FE-F3E6-4D7B-8AD4-56B8F7A235A7&citation=eyJlbmRJbmRleCI6MTk5NDEsIm1ldGFkYXRhIjp7Imljb25VcmwiOiJodHRwczpcL1wvd3d3Lmdvb2dsZS5jb21cL3MyXC9mYXZpY29ucz9zej02NCZkb21haW49bnBtdHJlbmRzLmNvbSIsInByZXZpZXdUaXRsZSI6Imlzb21vcnBoaWMtZ2l0IHZzIG5vZGVnaXQgdnMgc2ltcGxlLWdpdCB8IG5wbSB0cmVuZHMiLCJzb3VyY2UiOiJucG0gVHJlbmRzIiwidHlwZSI6ImdlbmVyaWNfbWV0YWRhdGEifSwic291cmNlcyI6W3siaWNvblVybCI6Imh0dHBzOlwvXC93d3cuZ29vZ2xlLmNvbVwvczJcL2Zhdmljb25zP3N6PTY0JmRvbWFpbj1ucG10cmVuZHMuY29tIiwic291cmNlIjoibnBtIFRyZW5kcyIsInRpdGxlIjoiaXNvbW9ycGhpYy1naXQgdnMgbm9kZWdpdCB2cyBzaW1wbGUtZ2l0IHwgbnBtIHRyZW5kcyIsInVybCI6Imh0dHBzOlwvXC9ucG10cmVuZHMuY29tXC9pc29tb3JwaGljLWdpdC12cy1ub2RlZ2l0LXZzLXNpbXBsZS1naXQifV0sInN0YXJ0SW5kZXgiOjE5OTM2LCJ0aXRsZSI6Im5wbSBUcmVuZHMiLCJ1cmwiOiJodHRwczpcL1wvbnBtdHJlbmRzLmNvbVwvaXNvbW9ycGhpYy1naXQtdnMtbm9kZWdpdC12cy1zaW1wbGUtZ2l0IiwidXVpZCI6IjM2YjkxNWQ2LWFmYzgtNDg3YS04MDRlLTNiOWE4ZGIxMDAyNSJ9 “isomorphic-git vs nodegit vs simple-git|npm trends”)](https://npmtrends.com/isomorphic-git-vs-nodegit-vs-simple-git)|5,659               |
|0 nativas                                                                   |Python runtime      |
|✅✅✅                                                                         |✅✅                  |
|⚠️ Lento                                                                     |✅ Bueno             |
|✅                                                                           |✅ Isolated          |
|❌                                                                           |✅ Builtin           |
|Media                                                                       |Alta                |
|✅✅✅                                                                         |❌                   |
|2 días                                                                      |4 días              |
|Browser only                                                                |Análisis avanzado V2|

**Decisión**: simple-git MVP + escomplex complexity; PyDriller post-MVP si research metrics.

-----

## 5. SNIPPETS CÓDIGO CLAVE

### OpenTelemetry Correlación Task→Trace

```typescript
// instrumentation.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_COLLECTOR_URL || 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

// Atributos custom correlación
export const DevVizAttributes = {
  JIRA_TICKET_ID: 'jira.ticket_id',
  GIT_COMMIT_SHA: 'git.commit_sha',
  DEPLOYMENT_ENVIRONMENT: 'deployment.environment',
};

// API con instrumentación manual
import { trace, propagation } from '@opentelemetry/api';
const tracer = trace.getTracer('viz-platform', '1.0.0');

app.post('/api/deploy', async (req, res) => {
  return tracer.startActiveSpan('deploy-operation', async (span) => {
    span.setAttributes({
      [DevVizAttributes.JIRA_TICKET_ID]: req.body.taskId,
      [DevVizAttributes.GIT_COMMIT_SHA]: req.body.commitSha,
    });
    
    // Propagar vía Baggage
    const baggage = propagation.createBaggage({
      [DevVizAttributes.JIRA_TICKET_ID]: { value: req.body.taskId },
    });
    
    await context.with(propagation.setBaggage(context.active(), baggage), async () => {
      const result = await performDeployment(req.body);
      res.json(result);
    });
    
    span.end();
  });
});
```

### Hotspot Analysis con simple-git

```javascript
// hotspot-service.js
const simpleGit = require('simple-git');
const escomplex = require('escomplex');

class HotspotAnalyzer {
  constructor(repoPath) {
    this.git = simpleGit(repoPath);
    this.repoPath = repoPath;
  }

  async calculateChurn(since = '6 months ago') {
    const log = await this.git.raw([
      'log', '--format=format:', '--name-only',
      `--since=${since}`, '--', '*.js', '*.ts'
    ]);
    
    const files = log.split('\n').filter(f => f.trim());
    const churnMap = {};
    files.forEach(file => {
      churnMap[file] = (churnMap[file] || 0) + 1;
    });
    return churnMap;
  }

  async calculateComplexity(filePath) {
    const code = await fs.readFile(path.join(this.repoPath, filePath), 'utf-8');
    const result = escomplex.analyse(code);
    return {
      cyclomatic: result.aggregate.cyclomatic,
      sloc: result.aggregate.sloc.physical,
    };
  }

  async identifyHotspots(options = {}) {
    const { since = '6 months ago', topN = 20 } = options;
    const churnMap = await this.calculateChurn(since);
    const hotspots = [];
    
    for (const [file, churn] of Object.entries(churnMap)) {
      const complexity = await this.calculateComplexity(file);
      const score = churn * complexity.cyclomatic;
      hotspots.push({ file, churn, complexity: complexity.cyclomatic, score });
    }
    
    return hotspots.sort((a, b) => b.score - a.score).slice(0, topN);
  }
}
```

### ClickHouse Schema y Consultas

```sql
-- Schema telemetría
CREATE TABLE otel.traces (
  Timestamp DateTime64(9) CODEC(Delta, ZSTD(1)),
  TraceId String CODEC(ZSTD(1)),
  SpanName LowCardinality(String),
  Duration UInt64,
  
  -- Atributos correlación
  `Attributes.jira.ticket_id` String CODEC(ZSTD(1)),
  `Attributes.git.commit_sha` String CODEC(ZSTD(1)),
  
  -- Índices bloom filter
  INDEX idx_jira_ticket `Attributes.jira.ticket_id` TYPE bloom_filter(0.01) GRANULARITY 1
) ENGINE = MergeTree()
PARTITION BY toDate(Timestamp)
ORDER BY (SpanName, toUnixTimestamp(Timestamp), TraceId)
TTL toDateTime(Timestamp) + INTERVAL 30 DAY;

-- Consulta: Trazas por ticket
SELECT SpanName, Duration / 1000000 AS DurationMs
FROM otel.traces
WHERE `Attributes.jira.ticket_id` = 'PROJ-123'
ORDER BY Timestamp DESC LIMIT 100;

-- Consulta: Performance promedio por ticket
SELECT 
  `Attributes.jira.ticket_id` AS ticket,
  AVG(Duration) / 1000000 AS avg_ms,
  quantile(0.95)(Duration) / 1000000 AS p95_ms
FROM otel.traces
WHERE Timestamp >= now() - INTERVAL 7 DAY
GROUP BY ticket
ORDER BY avg_ms DESC LIMIT 20;
```

### Visualización Commit Graph (Cytoscape.js)

```javascript
// CommitGraph.jsx
import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

export const CommitGraph = ({ commits, onCommitClick }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const nodes = commits.map(c => ({
      data: { id: c.sha, label: c.message.substring(0, 50) }
    }));
    
    const edges = [];
    commits.forEach(c => {
      (c.parent_shas || []).forEach(parent => {
        edges.push({ data: { source: parent, target: c.sha } });
      });
    });

    const cy = cytoscape({
      container: containerRef.current,
      elements: { nodes, edges },
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#4ECDC4',
            'label': 'data(label)',
          }
        }
      ],
      layout: { name: 'cose', animate: false }
    });

    cy.on('tap', 'node', (evt) => onCommitClick(evt.target.data()));
    
    return () => cy.destroy();
  }, [commits]);

  return <div ref={containerRef} style={{ width: '100%', height: '600px' }} />;
};
```

-----

## 6. RIESGOS TÉCNICOS Y MITIGACIÓN

### Matriz Riesgos Completa

|ID   |Riesgo                              |Prob |Impacto|Score|Mitigación                                                                               |
|-----|------------------------------------|-----|-------|-----|-----------------------------------------------------------------------------------------|
|R-001|Repos \u003e100K commits performance|Alta |Crítico|12   |Shallow clones, análisis incremental, cache PostgreSQL, background jobs, límite MVP 500K |
|R-002|High-cardinality telemetry explosion|Media|Crítico|8    |Tail sampling 10-100x, TTL 7d→30d→365d, pre-agregaciones, alertas storage \u003e80%      |
|R-003|API keys en código                  |Media|Crítico|8    |Vault/Secrets Manager, pre-commit hooks, JWT short-lived, rate limiting, audit logs      |
|R-004|Source code exposure                |Media|Alto   |6    |RBAC estricto, no full file contents, redact secrets, SOC2 roadmap, self-hosted option   |
|R-005|Consistencia cross-DB               |Alta |Medio  |6    |CDC Debezium día 1, event sourcing, idempotent processing, reconciliation nocturnos      |
|R-006|ClickHouse ops complexity           |Media|Alto   |6    |ClickHouse Cloud managed, training 2 weeks, Prometheus monitoring, backups tested mensual|
|R-007|Git API rate limits                 |Alta |Medio  |6    |Cache 24h TTL, webhooks real-time, GitHub Enterprise 5000 req/h, exponential backoff     |
|R-008|PostgreSQL bottleneck               |Media|Medio  |4    |Read replicas, PgBouncer pooling, índices optimizados, Citus extension si necesario      |
|R-009|Adopción developers baja            |Media|Medio  |4    |Focus killer feature, weekly demos, Slack integration, champions program                 |
|R-010|Technical debt                      |Media|Medio  |4    |Code reviews 2 approvers, tech debt sprints 20% time, linting, coverage \u003e80%        |

-----

## 7. ESTIMACIÓN INFRAESTRUCTURA

### Requisitos Hardware

|Usuarios|vCPU Total|RAM Total|Storage Total|Costo Cloud/mes|Costo On-Premise/mes   |
|--------|----------|---------|-------------|---------------|-----------------------|
|10      |9         |18 GB    |170 GB       |$228 (AWS)     |$71 (amortizado 3 años)|
|25      |18        |36 GB    |400 GB       |$463 (AWS)     |$142                   |
|50      |34        |72 GB    |850 GB       |$1,024 (AWS)   |$283                   |

**Break-even on-premise**: 22-24 meses

**Recomendación**: Cloud MVP validación (\u003c2 años); on-premise si \u003e25 usuarios long-term.

-----

## 8. CONCLUSIONES Y RECOMENDACIONES

### Validación Técnica Final

**✅ Hipótesis confirmadas:**

1. ClickHouse superior para analytics (5-20x performance, 12-19x compresión)
1. Polyglot persistence viable (GitLab, Uber, PostHog validan)
1. simple-git producción-ready (5.9M downloads/semana)
1. OpenTelemetry maduro Node.js (stable, 1000s empresas producción)

**⚠️ Riesgos principales mitigables:**

1. Performance repos grandes → Análisis incremental + caching
1. ClickHouse ops → Managed service (ClickHouse Cloud)
1. High cardinality → Tail sampling + retention policies

### Roadmap Ejecutivo

**Q1 2025 (Meses 1-4): MVP Launch**

- Git GUI + hotspots + Task→Commits
- 10-25 usuarios beta
- **Inversión**: 33 developer-weeks (2 devs × 4 meses)
- **Costo**: $80-250/mes infra

**Q2-Q3 2025 (Meses 5-9): V2 Telemetry**

- OpenTelemetry + ClickHouse + Task→Trace
- 50-100 usuarios
- **Inversión**: 41 developer-weeks
- **Costo**: $1,500-3,200/mes infra

**Q4 2025 (Meses 10-12): Enterprise**

- SSO/SAML, multi-tenancy, SOC2 inicio
- 200+ usuarios potential

### Decisiones Críticas Inmediatas

1. **Team**: Contratar 2 devs (backend Node.js, frontend React) pre-inicio
1. **Cloud**: AWS recomendado (madurez RDS + ClickHouse community)
1. **Managed services**: RDS + ClickHouse Cloud para MVP
1. **Security first**: Vault, RBAC configurar ANTES primer commit

### Métricas Éxito MVP (Mes 4)

- ✅ 50+ daily active users
- ✅ \u003c2s load commit graph (p95)
- ✅ 99% uptime SLA
- ✅ NPS ≥ 40
- ✅ 10+ hotspots → refactorings iniciados

### Next Steps Accionables

**Semana 1:**

1. Aprobar presupuesto $200K (devs + infra 9 meses)
1. Job postings: Senior Backend (Node.js), Frontend (React)
1. AWS account + Terraform IaC

**Semana 2-4:**
4. Onboarding equipo
5. Setup: GitHub repo, CI/CD, Docker compose
6. Sprint 1: Infraestructura + Git Mining

**Mes 4:**
7. MVP launch interno
8. Retrospective, plan V2

-----

## FUENTES PRINCIPALES

1. **ClickHouse**: “Billion-Row Matchup vs Elasticsearch” (Mayo 2024) - 5-12x faster, 12-19x compression
1. **HyperDX**: “Why ClickHouse Over Elasticsearch” - 70% cost reduction case study
1. **GitLab**: “Two Sizes Fit Most” architecture blog (PostgreSQL + ClickHouse)
1. **PyDriller**: FSE 2018 paper “Python framework for mining repositories”
1. **OpenTelemetry**: Official Node.js SDK documentation (stable 2024)
1. **Cytoscape.js**: Graph visualization library docs + examples
1. **ECharts**: Apache ECharts performance benchmarks (millions datapoints)
1. **Cloudflare**: “Log analytics using ClickHouse” - 8x CPU reduction
1. **simple-git**: GitHub steveukx/git-js (5.9M weekly downloads)
1. **Wettel & Lanza (2007)**: “Visualizing Software Systems as Cities” academic paper

-----

**FIN REPORTE TÉCNICO**
**Fecha**: Noviembre 2025
**Versión**: 1.0 Final
