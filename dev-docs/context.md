## 1. CONTEXT.MD - SÍNTESIS TÉCNICA EJECUTIVA

### El Problema: Abismo de Contexto

El desarrollo de software moderno opera en tres perspectivas aisladas:

**Macro (Planificación):** Jira, Linear, épicas, sprints → Visible para Product Managers
**Meso (Evolución código):** Git commits, branches, diffs → Visible para Developers  
**Micro (Ejecución):** Trazas, métricas, logs runtime → Visible para SRE/DevOps

**Consecuencias medibles:**

- 40% tiempo debugging navegando entre herramientas (Stack Overflow Survey 2023)
- Imposible responder: “¿Qué código causó esta latencia para feature X?”
- Decisiones arquitectura basadas en datos fragmentados

### Hipótesis Validada

Arquitectura multibase especializada puede cerrar el abismo mediante:

1. **Correlación end-to-end**: Ticket JIRA-123 → Commits abc123 → Pipeline CI/CD → Traces producción
1. **Visualizaciones intuitivas**: Grafos Git interactivos, heatmaps hotspots, timelines Task→Trace
1. **Performance óptima**: ClickHouse para OLAP 5-100x más rápido que monolítico

### Estado del Arte Tecnológico (2024-2025)

#### Almacenamiento Analítico: ClickHouse Domina

**Benchmarks actualizados 2024:**

- **Query performance**: 6.6s vs 33s Elasticsearch en 10B filas (5x más rápido)
- **Compresión**: 42GB vs 513GB para mismo dataset (12x mejor)
- **Throughput**: 2.2M eventos/seg vs 330K-1.2M Elasticsearch
- **High cardinality**: Sin degradación vs -72% Elasticsearch con 4M series únicas

**Casos reales:**

- **Cloudflare**: 8x reducción CPU, 10x compresión (600→60 bytes/fila)
- **Uber**: 50%+ reducción footprint cluster logs
- **ContentSquare**: 4x queries más rápidas, 11x más económico

**Decisión validada**: ClickHouse para telemetría, PostgreSQL para OLTP planificación. 

#### Minería Git: simple-git Batalla-Tested

**Evaluación comparativa:**

|Librería      |Downloads/semana|Repos \u003e100K commits|Dependencias nativas|Recomendación       |
|--------------|----------------|------------------------|--------------------|--------------------|
|**simple-git**|5.9M            |✅ Excelente             |❌ Ninguna           |**MVP Primaria**    |
|nodegit       |70K             |❌ Memory leaks          |✅ Python, CMake     |Evitar              |
|isomorphic-git|536K            |⚠️ Lento                 |❌ Ninguna           |Browser only        |
|PyDriller     |N/A Python      |✅ Excelente             |Python runtime      |Análisis avanzado V2|

**Patrón MVP recomendado:**

- simple-git para operaciones Git (zero native deps, cross-platform garantizado) 
- escomplex para complejidad ciclomática  
- code-complexity para hotspots (churn × complexity) 

#### OpenTelemetry: Correlación Cross-Domain

**Stack confirmado 2024-2025:**

```
Apps (Node.js + @opentelemetry/sdk-node)
  ↓ Auto-instrumentación
OTel Collector (batch, tail sampling)
  ↓ OTLP export
ClickHouse (storage analytics) + Jaeger/SigNoz (visualización)
```

**Patrones validados:**

- **Baggage API**: Propagar jira.ticket_id, git.commit_sha entre servicios 
- **Semantic attributes custom**: Vincular dominios (ticket→commit→pipeline→trace) 
- **Tail sampling**: Reducir volumen 10-100x manteniendo traces críticos (errores, latencia \u003e1s)
- **ClickHouse bloom filters**: Índices en ticket_id, commit_sha para queries O(log n)

#### Visualización Frontend

**Comparativa efectividad PM/Tech Leads:**

|Librería        |Flexibilidad|Velocidad Dev    |Performance     |Caso Uso Óptimo              |
|----------------|------------|-----------------|----------------|-----------------------------|
|**D3.js**       |Máxima      |Lenta (3-6 sem)  |Bueno \u003c10K |Visualizaciones únicas custom|
|**Cytoscape.js**|Alta grafos |Rápida (1-2 sem) |Excelente Canvas|**Grafos dependencias**      |
|**ECharts**     |Moderada    |Muy rápida (3-5d)|Millones puntos |**Dashboards, heatmaps**     |

**Metáforas visuales validadas (efectividad para audiencia no-técnica):**

1. **Timeline Task→Trace** (⭐⭐⭐⭐⭐): Flujo horizontal Jira→Git→CI/CD→Runtime. Intuitivo, accionable. 
1. **Force-directed graphs** (⭐⭐⭐⭐): Auto-organiza dependencias, identifica bottlenecks visualmente.  
1. **Heatmaps churn×complexity** (⭐⭐⭐⭐): Color = riesgo técnico. Universalmente entendido.
1. **Software City 3D** (⭐⭐⭐): Buildings = componentes. Impresionante pero requiere explicación. 
1. **Flame graphs simplificados** (⭐⭐⭐): Performance bottlenecks. Técnico pero accionable.

### Validación Supuestos Informe Base

**✅ Confirmados:**

- ClickHouse mejor opción telemetría (validado benchmarks actualizados) 
- PyDriller viable para análisis comportamiento  (con trade-offs IPC)
- D3.js necesario para visualizaciones novedosas diferenciadas

**⚠️ Corregidos:**

- PyDriller desde Node.js agrega complejidad (Python runtime). Para MVP: simple-git + escomplex más pragmático
- Elasticsearch NO recomendado: 5-20x más lento, 10-19x más storage, 3-10x costos superiores vs ClickHouse 

**❌ Gaps identificados:**

- CI/CD observability requiere instrumentación específica (patrones documentados sección OTel)
- Self-hosted security/ops trade-offs subestimados (estrategias en plan.md)

