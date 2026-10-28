<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { createReport, reportError, type ReportReason, type ReportTarget } from '../../api/reports'

const props = defineProps<{
  targetType: ReportTarget
  targetId: string
}>()

const reasons: { value: ReportReason; label: string }[] = [
  { value: 'insulto', label: 'Insulto o falta de respeto' },
  { value: 'dato_falso', label: 'Dato falso' },
  { value: 'fuera_de_tema', label: 'Fuera de tema' },
  { value: 'spam', label: 'Spam' },
  { value: 'datos_personales', label: 'Expone datos personales' },
]

const open = ref(false)
const reason = ref<ReportReason>('dato_falso')
const note = ref('')
const error = ref('')
const sent = ref(false)
const sending = ref(false)

const canReport = computed(() => /^\d+$/.test(props.targetId))
const signedIn = computed(() => localStorage.getItem('auth_token') !== null)
const fieldId = computed(() => `reporte-${props.targetType}-${props.targetId}`)

function toggle(): void {
  open.value = !open.value
  error.value = ''
}

async function send(): Promise<void> {
  error.value = ''
  if (!signedIn.value) {
    error.value = 'Entra para reportar.'
    return
  }

  sending.value = true
  try {
    await createReport({
      targetType: props.targetType,
      targetId: props.targetId,
      reason: reason.value,
      body: note.value,
    })
    sent.value = true
    open.value = false
    note.value = ''
  } catch (cause) {
    error.value = reportError(cause)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div v-if="canReport" class="contents">
    <button type="button" class="font-medium text-slate-500 hover:text-slate-900" @click="toggle">
      {{ open ? 'Cerrar reporte' : 'Reportar' }}
    </button>
    <p v-if="sent && !open" class="w-full text-xs text-slate-600" role="status">Reporte enviado. Queda para revisión.</p>
    <form v-if="open" class="w-full rounded-lg bg-canvas p-3" @submit.prevent="send">
      <p v-if="!signedIn" class="text-sm text-slate-700">
        <RouterLink to="/ingresar" class="font-medium text-brand">Entra</RouterLink>
        para reportar.
      </p>
      <template v-else>
        <label class="block text-xs font-semibold text-slate-700" :for="fieldId">Motivo</label>
        <select :id="fieldId" v-model="reason" class="mt-1 h-10 w-full rounded-md bg-white px-2 text-sm">
          <option v-for="item in reasons" :key="item.value" :value="item.value">{{ item.label }}</option>
        </select>
        <label class="mt-2 block text-xs font-semibold text-slate-700" :for="`${fieldId}-detalle`">Detalle, si hace falta</label>
        <textarea
          :id="`${fieldId}-detalle`"
          v-model="note"
          rows="2"
          maxlength="500"
          class="mt-1 w-full resize-y rounded-md bg-white px-2 py-2 text-sm outline-none ring-brand focus:ring-2"
        />
        <button type="submit" class="mt-2 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-deep" :disabled="sending">
          {{ sending ? 'Enviando...' : 'Enviar reporte' }}
        </button>
      </template>
      <p v-if="error" class="mt-2 text-xs text-red-700" role="alert">{{ error }}</p>
    </form>
  </div>
</template>
