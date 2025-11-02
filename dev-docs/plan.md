## 2. PLAN.MD - ARQUITECTURA DETALLADA

### Diagrama Arquitectura Multibase

```
┌─────────────────────────────────────────────────────────────┐
│              CAPA APLICACIÓN (Node.js + Express)             │
│  GraphQL API │ REST API │ WebSocket Server (real-time)      │
└──────────────┬──────────────┬────────────────────────────────┘
               │              │                ↓
   ┌───────────┴───┐  ┌───────┴──────┐  ┌─────────────────┐
   │ PostgreSQL 16 │  │ Git Mining   │  │  ClickHouse     │
   │     (OLTP)    │  │   Service    │  │    (OLAP)       │
   │               │  │              │  │                 │
   │ • users       │  │ • simple-git │  │ • traces        │
   │ • projects    │  │ • commits    │  │ • metrics       │
   │ • tasks       │  │ • hotspots   │  │ • logs          │
   │ • task_commits│  │ • cache PG   │  │ • high-card     │
   │               │  │              │  │                 │
   │ ACID, joins   │  │ Batch+cache  │  │ Columnar, TTL   │
   └───────────────┘  └──────────────┘  └─────────────────┘
         ↑                  ↑                    ↑
         └──────────────────┴────────────────────┘
              Event Streaming (Debezium + Kafka)

┌─────────────────────────────────────────────────────────────┐
│                   INTEGRACIONES EXTERNAS                     │
│  Jira API │ GitHub/GitLab API │ OTel Collector (apps)       │
└─────────────────────────────────────────────────────────────┘
```

### ADRs (Architectural Decision Records)

#### ADR-001: Arquitectura Multibase vs Monolítica

**Status**: Aceptado | **Fecha**: 2025-11

**Contexto**: Tres workloads distintos incompatibles con DB única:

- OLTP transaccional (usuarios, permisos) → requiere ACID
- Análisis histórico Git (agregaciones complejas) → requiere OLAP
- Time-series observabilidad (millones eventos/día) → requiere compresión columnar  

**Decisión**: Polyglot persistence

- **PostgreSQL**: Planning, usuarios, OLTP (4-16GB RAM)  
- **Git Mining Service**: Cache PostgreSQL + procesamiento on-demand simple-git
- **ClickHouse**: Telemetría, logs, métricas (8-32GB RAM) 

**Consecuencias**:

✅ **Positivas:**

- Performance óptima por dominio (5-100x mejoras documentadas) 
- PostgreSQL: ACID, foreign keys, transacciones OLTP 
- ClickHouse: Compresión 12-19x, queries 5-20x más rápidas 
- Escalado horizontal independiente 
- Costos: ClickHouse ~70% más económico que Elasticsearch 

❌ **Negativas:**

- Complejidad ops: 3 sistemas (monitoring, backups)
- Joins cross-DB en app layer (GraphQL resolvers)
- Consistencia eventual (CDC con Debezium) 
- Curva aprendizaje múltiple

**Mitigaciones:**

- Managed services (RDS, ClickHouse Cloud) reducen ops 80%  
- GraphQL abstrae complejidad
- CDC desde día 1 (battle-tested: Uber, Netflix)
- Documentación ownership claro

**Referencias**: GitLab “Two Sizes Fit Most”, HyperDX migration blog, ClickHouse benchmarks 2024 

#### ADR-002: ClickHouse vs Elasticsearch para Telemetría

**Status**: Aceptado

**Comparativa benchmarked:**

|Métrica                     |ClickHouse     |Elasticsearch   |Ratio               |
|----------------------------|---------------|----------------|--------------------|
|Query aggregation 10B filas |6.6s           |33s             |**5x más rápido**   |
|Compresión (10B filas)      |42GB           |513GB           |**12x mejor**       |
|Write throughput            |2.2M/s         |330K-1.2M/s     |**2-7x superior**   |
|High cardinality (4M series)|Sin degradación|-72% performance|**Crítico**         |
|Storage cost AWS            |~$0.02/GB/mes  |~$0.15/GB/mes   |**7x más económico**|

**Decisión**: ClickHouse para telemetría

**Rationale:**

1. Performance 5-20x en agregaciones (workload dominante) 
1. Infraestructura 30-70% más barata (Cloudflare case study) 
1. SQL familiar vs Elasticsearch DSL 
1. Proven at scale: Uber (exabytes), Cloudflare, MessageBird 

**Consecuencias:**

- ✅ Queries subsegundo en billones filas
- ✅ Retención ilimitada económica (S3 cold) 
- ⚠️ Full-text search no óptimo (usar ngram/bloom filters)
- ⚠️ Inserts batch obligatorios (OTel Collector maneja)

#### ADR-003: simple-git + escomplex vs nodegit vs PyDriller

**Decisión**: simple-git para MVP, PyDriller V2 opcional

**Rationale MVP:**

- simple-git: 5.9M downloads/semana,   zero native deps, cross-platform 
- nodegit: memory leaks documentados (Issue #766), compilation hell
- PyDriller: requiere Python runtime  (complejidad deployment self-hosted)

**Para análisis académico avanzado post-MVP**: PyDriller ofrece métricas integradas. 

### Alcance MVP Mínimo Defendible

**Filosofía**: Un solo killer feature ejecutado excelentemente → Adopción desarrolladores 

#### Feature 1: Git GUI Superior con Integración Tickets ⭐

**Criterios aceptación:**

- [ ] Grafo commits hasta 100K en \u003c2s (p95)
- [ ] Topología branches/merges interactiva (zoom, pan)
- [ ] Click commit → mostrar ticket Jira inline 
- [ ] Click ticket → ver todos commits vinculados
- [ ] Filtros: autor, fechas, branch, ticket_id
- [ ] Parsing automático: `PROJ-123`, `#456`, `fixes JIRA-789` 

**Stack**: React + Cytoscape.js (Canvas), simple-git, PostgreSQL cache

**User story**: “Como developer, quiero ver qué commits pertenecen a qué ticket sin cambiar herramienta, para entender cambios en contexto negocio.”

#### Feature 2: Análisis Hotspots Básico

**Criterios aceptación:**

- [ ] Calcular churn: commits/archivo en 30/90/180 días
- [ ] Score hotspot: churn × complejidad ciclomática
- [ ] Visualización heatmap (ECharts) con drill-down
- [ ] Export CSV top N hotspots
- [ ] Alertas configurables: archivo \u003e threshold

**User story**: “Como tech lead, quiero identificar archivos con churn excesivo para priorizar refactoring.”

#### Feature 3: Vista Task→Commits

**Criterios aceptación:**

- [ ] Importar tasks Jira/Linear vía API
- [ ] Timeline commits por task con files changed
- [ ] Link GitHub/GitLab para diff completo
- [ ] Badge: tasks con 0 commits (trabajo no iniciado)

**User story**: “Como PM, quiero ver qué código se escribió para cada task, para verificar completitud.”

### Features EXCLUIDOS MVP (V2)

- ❌ OpenTelemetry/runtime traces (requiere infra ClickHouse)
- ❌ Dynamic system maps (service discovery automático)
- ❌ Code quality avanzada (SonarQube integration)
- ❌ ML predictions
- ❌ Multi-repo dependency graphs

**Rationale**: MVP 4 meses; V2 features +8-12 meses.

### Roadmap V2 (Meses 4-12)

**Fase 1: Fundación Telemetría (M4-M6, 8-10 dev-weeks)**

- Deploy ClickHouse cluster 3-node 
- OpenTelemetry Collector (batch, sampling) 
- Instrumentación Node.js apps  
- UI básica: Jaeger + ClickHouse backend

**Fase 2: Task→Trace End-to-End (M7-M9, 10-12 dev-weeks)**

- Baggage propagation: inject jira.ticket_id en traces 
- Query: “Todas trazas para JIRA-123”
- Métricas por task: p50/p95/p99 latency, error rate
- Flamegraphs simplificados

**Fase 3: Mapa Dinámico Sistema (M10-M12, 12-14 dev-weeks)**

- Service discovery desde traces
- Grafo dependencias runtime observado
- Comparación: diseñado vs real
- Change impact analysis

### Estimación Esfuerzo Desarrollador

**Metodología**: 3-point estimation + 20% buffer, 2 devs full-time

|Componente        |Optimista |Likely      |Pesimista |Buffer 20% |
|------------------|----------|------------|----------|-----------|
|Infraestructura   |2 sem     |3 sem       |4 sem     |**3.6 sem**|
|Git Mining Service|4 sem     |6 sem       |9 sem     |**7.2 sem**|
|Git GUI Superior  |5 sem     |7 sem       |10 sem    |**8.4 sem**|
|Análisis Hotspots |2 sem     |3 sem       |5 sem     |**3.6 sem**|
|Vista Task→Commits|3 sem     |4 sem       |6 sem     |**4.8 sem**|
|Testing & QA      |2 sem     |3 sem       |4 sem     |**3.6 sem**|
|Documentación     |1 sem     |1.5 sem     |2 sem     |**1.8 sem**|
|**TOTAL MVP**     |**19 sem**|**27.5 sem**|**40 sem**|**33 sem** |

**Timeline MVP**: 33 developer-weeks = **16.5 semanas calendario** (2 devs) ≈ **4 meses**

**V2**: 41 developer-weeks adicionales ≈ **5 meses** (total proyecto: 9 meses)

### Costos Infraestructura Self-Hosted

**Requisitos por usuarios:**

|Componente         |10 Users               |25 Users                |50 Users                |
|-------------------|-----------------------|------------------------|------------------------|
|**Node.js App**    |2 vCPU, 4GB            |4 vCPU, 8GB             |8 vCPU, 16GB            |
|**PostgreSQL**     |2 vCPU, 4GB, 50GB      |4 vCPU, 8GB, 100GB      |8 vCPU, 16GB, 250GB     |
|**ClickHouse (V2)**|4 vCPU, 8GB, 100GB     |8 vCPU, 16GB, 250GB     |16 vCPU, 32GB, 500GB    |
|**Redis**          |1 vCPU, 2GB            |2 vCPU, 4GB             |2 vCPU, 8GB             |
|**TOTAL**          |**9 vCPU, 18GB, 170GB**|**18 vCPU, 36GB, 400GB**|**34 vCPU, 72GB, 850GB**|

**Costos mensuales cloud:**

|Usuarios|AWS   |GCP |On-Premise (amortizado)   |
|--------|------|----|--------------------------|
|10      |$228  |$166|$71 (break-even 22 meses) |
|25      |$463  |$338|$142 (break-even 24 meses)|
|50      |$1,024|$681|$283 (break-even 23 meses)|

**Recomendación**: Cloud para MVP validación; on-premise si \u003e25 usuarios long-term.

-----
