# shared/

Esta carpeta contiene **componentes, directivas y pipes reutilizables** de UI que se comparten entre dos o más features del CRM.

## Cuándo agregar algo aquí

- El elemento es usado en **más de un feature** (`dashboard`, `leads`, `ventas`, etc.).
- Es un elemento **puramente presentacional** (no tiene lógica de negocio propia).

## Estructura sugerida

```
shared/
├── components/
│   ├── button/          (app-button)
│   ├── modal/           (app-modal)
│   ├── badge/           (app-badge)
│   └── empty-state/     (app-empty-state)
├── directives/
│   └── click-outside/
└── pipes/
    └── truncate/
```

## Reglas

- **No** importar servicios de `core/services/` aquí; los componentes shared solo reciben datos vía `@Input()` y emiten eventos vía `@Output()`.
- Cada componente debe tener su propio directorio con `.ts`, `.html`, `.css` y `.spec.ts`.
- Exportar todo desde un barrel (`index.ts`) cuando el módulo crezca.
