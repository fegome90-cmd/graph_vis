# BACKLOG TÉCNICO - MVP Grafo de Dependencias

---

### Épica 1: Infraestructura y Base de la Aplicación (1 semana)

*   **US-001: Configuración del Proyecto**
    *   **[HECHO]** Inicializar proyecto React con TypeScript y Vite/Create React App.
    *   **[HECHO]** Configurar Tailwind CSS y las fuentes (`Space Grotesk`).
    *   **[HECHO]** Estructurar el layout principal de la aplicación (Header, Sidebars, Main content).

*   **US-002: Definición de la Estructura de Datos**
    *   **[HECHO]** Crear interfaces TypeScript (`NodeData`, `LinkData`) para el grafo de dependencias.
    *   **[HECHO]** Crear un conjunto de datos de mock (`constants.ts`) para el desarrollo y las pruebas iniciales.

---

### Épica 2: Visualización del Grafo (3 semanas)

*   **US-010: Renderizado Básico del Grafo**
    *   **[HECHO]** Integrar Cytoscape.js en un componente de React.
    *   **[HECHO]** Renderizar nodos y enlaces a partir de los datos de mock.
    *   **[HECHO]** Implementar un layout de fuerzas (`cose`) para la distribución automática de nodos.
    *   **[HECHO]** Habilitar controles básicos de zoom y paneo.

*   **US-011: Diseño de Nodos "Flowise"**
    *   **[HECHO]** Crear una función que genere SVGs como `background-image` para los nodos, incluyendo cabecera, cuerpo y barra de estado.
    *   **[HECHO]** La barra de estado debe reflejar la propiedad `importance` con color y altura variables.
    *   **[HECHO]** El borde del nodo y un indicador SVG deben señalar visualmente los `hotspots`.

*   **US-012: Interactividad del Grafo**
    *   **[HECHO]** Implementar efecto de "flotación" (sombra) al arrastrar nodos.
    *   **[HECHO]** Al pasar el ratón (`hover`), el nodo y sus vecinos se resaltan, y el resto del grafo se atenúa.
    *   **[HECHO]** Al hacer clic (`select`), el estado de resaltado persiste. El clic en el fondo deselecciona.

*   **US-013: Paneles de Información Contextual**
    *   **[HECHO]** Crear un componente `RightSidebar` que muestre detalles del nodo seleccionado.
    *   **[HECHO]** Crear un componente de `GraphLegend` que explique la simbología del grafo.
    *   **[HECHO]** Implementar botones de control para refrescar el layout, alternar la leyenda y entrar en modo de pantalla completa.

---

### Épica 3: Pruebas y Documentación (0.5 semanas)

*   **US-050: Pruebas de Componentes**
    *   Configurar un framework de pruebas (ej. Jest, Vitest).
    *   Añadir pruebas unitarias para las funciones de ayuda (ej. `createNodeSvg`).

*   **US-060: Documentación Técnica**
    *   **[HECHO]** Crear/mantener los `dev-docs` (`context.md`, `plan.md`, `task.md`).
    *   Añadir comentarios JSDoc a los componentes y funciones clave.
