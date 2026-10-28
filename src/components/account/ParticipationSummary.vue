<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchParticipation, updateMetricsConsent, type Participation } from '../../api/participation'

const participation = ref<Participation | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    participation.value = await fetchParticipation()
  } catch {
    error.value = 'No se pudo cargar tu participación.'
  } finally {
    loading.value = false
  }
})

async function setConsent(consent: boolean): Promise<void> {
  saving.value = true
  error.value = ''

  try {
    participation.value = await updateMetricsConsent(consent)
  } catch {
    error.value = 'No se pudo actualizar el consentimiento.'
  } finally {
    saving.value = false
  }
}

const totals = [
  { key: 'debates', label: 'Debates' },
  { key: 'arguments', label: 'Argumentos' },
  { key: 'votes', label: 'Votos' },
  { key: 'argument_votes', label: 'Votos a argumentos' },
  { key: 'reactions', label: 'Reacciones' },
] as const
</script>

<template>
  <p v-if="loading" class="text-sm text-slate-500">Cargando tu participación…</p>
  <p v-else-if="error && !participation" class="text-sm text-red-700" role="alert">{{ error }}</p>
  <div v-else-if="participation?.consent" class="space-y-4">
    <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Tu participación">
      <li v-for="item in totals" :key="item.key" class="rounded-lg bg-slate-50 px-3 py-3">
        <p class="text-xl font-semibold text-brand">{{ participation[item.key] ?? 0 }}</p>
        <p class="text-xs text-slate-500">{{ item.label }}</p>
      </li>
    </ul>
    <dl class="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
      <div class="flex items-center justify-between gap-3 rounded-lg px-1">
        <dt>Participación</dt>
        <dd class="font-semibold">{{ participation.participation }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3 rounded-lg px-1">
        <dt>Calidad</dt>
        <dd class="font-semibold">{{ participation.quality }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3 rounded-lg px-1">
        <dt>Respeto</dt>
        <dd class="font-semibold">{{ participation.respect }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3 rounded-lg px-1">
        <dt>Influencia</dt>
        <dd class="font-semibold">{{ participation.influence }}</dd>
      </div>
    </dl>
    <p class="text-sm leading-relaxed text-slate-600">
      Participación suma lo que publicaste y votaste. Calidad cuenta los apoyos a favor de tus argumentos. Respeto baja con reportes abiertos. Influencia suma me gusta y veces que compartieron tus debates. El detalle está en la
      <RouterLink to="/privacidad" class="font-medium text-brand underline">privacidad</RouterLink>.
    </p>
    <p v-if="participation.candidate" class="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
      Quedas en la lista privada de candidatos a líder. Esa revisión no se publica.
    </p>
    <p v-if="error" class="text-sm text-red-700" role="alert">{{ error }}</p>
    <button
      type="button"
      class="text-sm font-medium text-slate-600 underline"
      :disabled="saving"
      @click="setConsent(false)"
    >
      Apagar el perfil de métricas
    </button>
  </div>
  <div v-else class="space-y-3">
    <p class="text-sm leading-relaxed text-slate-700">
      El perfil de métricas está apagado en esta cuenta. La participación se guarda solo con ese consentimiento. Puedes leer qué incluye en
      <RouterLink to="/privacidad" class="font-medium text-brand underline">privacidad</RouterLink>.
    </p>
    <p v-if="error" class="text-sm text-red-700" role="alert">{{ error }}</p>
    <button
      type="button"
      class="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      :disabled="saving"
      @click="setConsent(true)"
    >
      Acepto el perfil de métricas
    </button>
  </div>
</template>
