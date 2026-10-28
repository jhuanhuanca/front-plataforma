# AGENTS.md — Frontend Plataforma

## Contexto del Proyecto

SPA de deliberación ciudadana. Los usuarios debaten sobre noticias y políticos.
Stack: Vue 3, Vite, Pinia, TypeScript, Tailwind CSS, PWA.

## Estructura de Directorios

```
src/
├── api/             # Cliente axios tipado
├── stores/          # Pinia stores por dominio
├── views/           # Vistas por página
├── components/
│   ├── ui/          # Componentes genéricos
│   ├── debate/      # Árbol de argumentos, votos
│   └── news/        # Tarjetas de noticias
├── composables/     # useAuth, useWebsocket, usePagination
├── router/
└── i18n/
```

## Convenciones

- `<script setup lang="ts">` SIEMPRE, nunca Options API
- Componentes en PascalCase (`UserCard.vue`)
- Composables con prefijo `use` (`useAuth.ts`)
- Stores Pinia por feature, no monolíticos
- Props tipadas con `defineProps<Props>()`
- Emits tipados con `defineEmits<Events>()`
- `defineModel()` para v-model personalizado (Vue 3.4+)

## Reglas Críticas

1. NUNCA mutar props directamente
2. NUNCA usar `any` — usar `unknown` y narrow
3. SIEMPRE lazy loading para rutas
4. SIEMPRE sanitizar HTML de argumentos (DOMPurify)
5. SIEMPRE manejar estados de carga y error
6. Accesibilidad AA mínimo (labels, contraste, teclado)
7. NUNCA hardcodear URLs de API — usar `import.meta.env`

## Autenticación

- Token Sanctum en localStorage (solo nick + token)
- Interceptor axios para inyectar token
- Redirección a login en 401
- Fingerprint generado en cliente (`device-id`)

## PWA

- Vite PWA plugin
- Workbox para cache
- Push notifications opcionales

## Testing

- Vitest para unit tests
- Vue Testing Library para componentes
- Playwright para e2e

## Comandos

```
npm run dev
npm run build
npm run test
npm run lint
```
