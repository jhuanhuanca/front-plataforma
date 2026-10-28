# MEMORY.md — Frontend

## Decisiones

- Vue 3 + Vite + Pinia + TypeScript
- Tailwind CSS
- PWA con Workbox (fase 5, todavía no)
- Token Sanctum en `localStorage` bajo la clave `auth_token`
- URL de API en `VITE_API_URL`

## Estado Actual

- [x] Fase 0.2 parcial: Vite, Vue 3, Pinia, Vue Router, Tailwind, cliente axios
- [x] Interfaz de referencia: `/` inicio, `/debates` feed, `/votaciones` encuestas
- [x] Rutas lazy: inicio, debates, votaciones e ingreso
- [ ] Vitest, Vue Testing Library, Playwright y ESLint (`npm run test` y `npm run lint` aún no existen)
- [ ] Fase 1: registro e ingreso reales contra la API
- [ ] Fase 2: feed de debates y crear argumento
- [ ] Fase 3: noticias y perfil
- [ ] Fase 4 del frontend: PWA y push

## Componentes Clave

Previstos, todavía sin implementar:

- `ArgumentTree`: árbol de argumentos anidados
- `StanceBadge`: postura a favor, en contra o neutral
- `VoteButtons`: votación de argumentos

## Problemas Conocidos

- Node del PATH es 20.20.2. Algunas dependencias de Vue/Vite avisan que prefieren Node 22 o superior. El dev server arranca igual.
