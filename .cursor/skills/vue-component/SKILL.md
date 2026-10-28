---
name: vue-component
description: Crea un componente Vue 3 con script setup, TypeScript, props y emits tipados, Tailwind y test co-locado. Usar al añadir componentes en front-plataforma, tarjetas, árboles de debate o UI.
---

# Crear componente Vue 3

## Cuándo usar

Cuando haya que crear un componente en `front-plataforma`.

## Pasos

1. Crear el archivo en `src/components/{categoria}/{Nombre}.vue`.
2. Usar `<script setup lang="ts">`.
3. Definir Props y Emits tipados.
4. Implementar el template.
5. Estilos con Tailwind. `scoped` solo si hace falta CSS que Tailwind no cubre.
6. Crear el test co-locado `{Nombre}.spec.ts` cuando Vitest esté instalado.

## Convenciones

- PascalCase y nombre de más de una palabra (`UserCard.vue`, no `Card.vue`).
- Props con `withDefaults()` cuando haya valores por defecto.
- No mutar props. HTML de usuarios pasa por DOMPurify.
- Estados de carga y error en el propio componente si habla con la API.
- Label visible en cada control.

```vue
<script setup lang="ts">
interface Props {
  title: string
  stance?: 'favor' | 'contra' | 'neutral'
}

withDefaults(defineProps<Props>(), {
  stance: 'neutral',
})

const emit = defineEmits<{
  vote: [stance: 'favor' | 'contra']
}>()
</script>

<template>
  <article class="rounded-lg border border-stone-200 bg-white p-4">
    <h2 class="text-lg font-semibold">{{ title }}</h2>
    <button type="button" @click="emit('vote', 'favor')">A favor</button>
  </article>
</template>
```
