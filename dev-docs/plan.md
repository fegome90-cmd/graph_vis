# PLAN DE DESARROLLO - ARQUITECTURA DETALLADA

## Alcance MVP: Visualización de Grafo de Dependencias del Sistema

**Filosofía**: Un solo "killer feature" ejecutado excelentemente → Facilitar el análisis de impacto y la comprensión de la arquitectura.

---

### Feature 1: Visualización de Grafo de Dependencias Estilo "Flowise"

**User story**: “Como desarrollador, quiero ver un mapa visual de los componentes de mi sistema y sus dependencias para poder entender rápidamente el impacto de mis cambios e identificar áreas de riesgo (hotspots).”

**Criterios de aceptación:**

*   **[HECHO]** El grafo renderiza nodos y enlaces a partir de un conjunto de datos estático.
*   **[HECHO]** Los nodos tienen un diseño estilo "Flowise" con una cabecera (icono + nombre) y un cuerpo.
*   **[HECHO]** Los nodos muestran una "barra de estado de importancia" vertical cuyo color y altura cambian dinámicamente.
*   **[HECHO]** Los nodos identificados como "hotspots" muestran un borde rojo y un indicador de alerta parpadeante.
*   **[HECHO]** El grafo es interactivo: se puede hacer zoom, pan y arrastrar nodos.
*   **[HECHO]** Al pasar el ratón sobre un nodo, este se resalta junto con sus vecinos directos, atenuando el resto del grafo.
*   **[HECHO]** Al hacer clic en un nodo, su estado de selección persiste y sus detalles se muestran en una barra lateral.
*   **[HECHO]** Una leyenda clara explica el significado de los diferentes tipos de nodos, el indicador de hotspot y la barra de importancia.

**Stack Técnico:**

*   **Frontend:** React con TypeScript
*   **Visualización de Grafo:** Cytoscape.js
*   **Estilos:** Tailwind CSS
*   **Componentes UI:** Componentes personalizados inspirados en Shadcn/UI

---

### Features EXCLUIDOS MVP (V2)

*   Integración con repositorios Git reales para análisis dinámico.
*   Conexión con sistemas de tickets (Jira, Linear) para vincular tareas a componentes del grafo.
*   Análisis de telemetría y trazas en tiempo de ejecución (OpenTelemetry).
*   Cálculo automático de "churn" y complejidad ciclomática.
*   Mapas de dependencias de sistema dinámicos (descubrimiento automático de servicios).
*   Análisis de calidad de código avanzado (integración con SonarQube).

**Rationale**: MVP enfocado en la excelencia de la visualización y la interacción con datos de muestra. La integración con sistemas externos se abordará en V2.

---

### Roadmap V2 (Post-MVP)

*   **Fase 1: Motor de Análisis de Código Estático (M4-M6)**
    *   **User Story**: "Como Tech Lead, quiero que la plataforma analice un repositorio Git para generar automáticamente el grafo de dependencias, para no depender de datos de muestra."
    *   **Criterios de Aceptación**:
        *   Un servicio de backend (Node.js) expone un endpoint para analizar un repositorio.
        *   Utiliza `simple-git` para leer el historial de cambios (churn).
        *   Utiliza un AST parser (ej. `@babel/parser`) para identificar dependencias (imports/exports).
        *   Utiliza `escomplex` para calcular la complejidad ciclomática.
        *   El endpoint devuelve una estructura `GraphData` que el frontend puede consumir.
        *   Los resultados del análisis se cachean (ej. en PostgreSQL) para mejorar el rendimiento en análisis subsecuentes.

*   **Fase 2: Integración con Tickets y Tareas (M7-M9)**
    *   **User Story**: "Como desarrollador, quiero ver qué tickets de Jira están asociados a cada nodo del grafo, para entender el contexto de negocio de los cambios."
    *   **Criterios de Aceptación**:
        *   Implementar parsing de mensajes de commit para extraer IDs de tickets (ej. `PROJ-123`).
        *   Conectar con la API de Jira para obtener detalles básicos del ticket (título, estado).
        *   Los nodos en el grafo afectados por commits de un ticket muestran un "badge" de Jira.
        *   El panel de detalles del nodo muestra la información del ticket vinculado.
        *   Añadir un filtro en la UI para buscar por ID de ticket y resaltar los nodos correspondientes.

*   **Fase 3: Fundación de Telemetría (M10-M12)**
    *   **User Story**: "Como SRE, quiero ver métricas de runtime (ej. latencia p99, tasa de errores) directamente en los nodos del grafo, para correlacionar problemas de producción con componentes específicos del código."
    *   **Criterios de Aceptación**:
        *   Desplegar un clúster de ClickHouse para analíticas de alto rendimiento.
        *   Instrumentar una aplicación de muestra con OpenTelemetry para exportar trazas y métricas.
        *   Crear un servicio que correlacione las trazas con los nodos del grafo (ej. a través de atributos semánticos).
        *   El panel de detalles del nodo en la UI muestra un resumen de las métricas clave de OpenTelemetry.