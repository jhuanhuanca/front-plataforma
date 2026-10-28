<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const open = ref(false)
const confirmation = ref('')

function cancel(): void {
  open.value = false
  confirmation.value = ''
  auth.error = ''
  auth.fieldErrors = {}
}

async function submit(): Promise<void> {
  const removed = await auth.removeAccount(confirmation.value)
  if (!removed) {
    return
  }

  await router.push({ path: '/ingresar', query: { aviso: 'cuenta-borrada' } })
}
</script>

<template>
  <section class="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/80">
    <button
      v-if="!open"
      type="button"
      class="text-sm font-medium text-red-700"
      @click="open = true"
    >
      Borrar cuenta
    </button>
    <form v-else class="space-y-3" @submit.prevent="submit">
      <p class="text-sm leading-relaxed text-slate-700">
        Se borran el nick, la sesión, la participación y los debates de esta cuenta. Este dispositivo puede crear otra después.
      </p>
      <div>
        <label class="text-sm font-medium" for="confirmar-nick">Escribe tu nick para confirmar</label>
        <input
          id="confirmar-nick"
          v-model="confirmation"
          type="text"
          autocomplete="off"
          maxlength="20"
          required
          class="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand"
        />
      </div>
      <p v-if="auth.fieldErrors.nick" class="text-sm text-red-700" role="alert">{{ auth.fieldErrors.nick[0] }}</p>
      <p v-else-if="auth.error" class="text-sm text-red-700" role="alert">{{ auth.error }}</p>
      <div class="flex flex-wrap gap-2">
        <button
          type="submit"
          class="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          :disabled="auth.loading"
        >
          Borrar definitivamente
        </button>
        <button type="button" class="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium" @click="cancel">
          Cancelar
        </button>
      </div>
    </form>
  </section>
</template>
