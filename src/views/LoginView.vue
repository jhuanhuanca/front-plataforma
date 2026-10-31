<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BrandLogo from '../components/brand/BrandLogo.vue'
import { departments } from '../data/departments'
import { municipalitiesOf } from '../data/municipalities'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const mode = ref<'login' | 'register'>(route.query.modo === 'ingresar' ? 'login' : 'register')
const name = ref('')
const email = ref('')
const nick = ref('')
const department = ref('')
const municipality = ref('')
const municipalityOptions = computed(() => municipalitiesOf(department.value))
const birthYear = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const consentTerms = ref(false)
const consentMetrics = ref(false)

const nickPattern = /^[a-zA-Z0-9_]+$/
const adultYear = computed(() => new Date().getFullYear() - 18)

watch(department, () => {
  if (!municipalityOptions.value.includes(municipality.value)) {
    municipality.value = ''
  }
})

function choose(next: 'login' | 'register'): void {
  mode.value = next
  auth.error = ''
  auth.fieldErrors = {}
}

function fieldMessage(key: string): string {
  return auth.fieldErrors[key]?.[0] ?? ''
}

function setField(key: string, message: string): boolean {
  auth.fieldErrors = { ...auth.fieldErrors, [key]: [message] }
  auth.error = message
  return false
}

function validateNick(): boolean {
  const value = nick.value.trim()
  if (value.length < 3 || value.length > 20 || !nickPattern.test(value)) {
    return setField('nick', 'El nick usa letras, números y guion bajo, de 3 a 20 caracteres.')
  }

  return true
}

function validateRegister(): boolean {
  auth.fieldErrors = {}
  if (name.value.trim().length < 2) {
    return setField('name', 'Escribe tu nombre.')
  }
  if (!email.value.includes('@')) {
    return setField('email', 'Escribe un correo válido.')
  }
  if (!validateNick()) {
    return false
  }
  if (!departments.includes(department.value as (typeof departments)[number])) {
    return setField('department', 'Elige un departamento de la lista.')
  }
  if (!municipalityOptions.value.includes(municipality.value)) {
    return setField('municipality', 'Elige un municipio de ese departamento.')
  }
  const year = Number(birthYear.value)
  if (!Number.isInteger(year) || year < 1900 || year > adultYear.value) {
    return setField('birth_year', 'Tienes que tener al menos 18 años para crear una cuenta.')
  }
  if (password.value.length < 8) {
    return setField('password', 'La contraseña tiene al menos 8 caracteres.')
  }
  if (password.value !== passwordConfirmation.value) {
    return setField('password_confirmation', 'La confirmación de la contraseña no coincide.')
  }
  if (!consentTerms.value) {
    return setField('consent_terms', 'Tienes que aceptar los términos.')
  }

  auth.error = ''
  return true
}

function continueAfterAuth(): Promise<void> {
  const next = typeof route.query.siguiente === 'string' ? route.query.siguiente : ''
  if (next.startsWith('/') && !next.startsWith('//')) {
    return router.push(next).then(() => undefined)
  }

  return router.push('/cuenta').then(() => undefined)
}

async function submit(): Promise<void> {
  auth.error = ''
  auth.fieldErrors = {}

  if (mode.value === 'register') {
    if (!validateRegister()) {
      return
    }

    const ok = await auth.register({
      name: name.value.trim(),
      email: email.value.trim(),
      nick: nick.value.trim(),
      department: department.value,
      municipality: municipality.value,
      birth_year: Number(birthYear.value),
      password: password.value,
      password_confirmation: passwordConfirmation.value,
      consent_terms: consentTerms.value,
      consent_metrics: consentMetrics.value,
    })
    if (ok) {
      await continueAfterAuth()
    }
    return
  }

  if (!validateNick()) {
    return
  }
  if (password.value.length < 8) {
    setField('password', 'La contraseña tiene al menos 8 caracteres.')
    return
  }

  const ok = await auth.login(nick.value, password.value)
  if (ok) {
    await continueAfterAuth()
  }
}

async function logout(): Promise<void> {
  await auth.logout()
}
</script>

<template>
  <section class="mx-auto max-w-lg px-4 py-8 sm:py-12">
    <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
      <BrandLogo class="mx-auto mb-4" />
      <h1 class="text-3xl font-semibold tracking-tight">Cuenta</h1>
      <p class="mt-3 text-sm leading-relaxed text-slate-600">
        Para comentar hace falta una cuenta. El registro pide nombre, correo, nick, departamento, municipio, contraseña y año de nacimiento. Solo pueden crear cuenta las personas de 18 años o más.
      </p>
      <p
        v-if="route.query.aviso === 'cuenta-borrada'"
        class="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
        role="status"
      >
        La cuenta fue borrada. Este dispositivo puede crear otra.
      </p>
      <p
        v-if="route.query.modo === 'registro' && !auth.isAuthenticated"
        class="mt-4 rounded-md bg-brand-soft px-3 py-2 text-sm text-brand"
        role="status"
      >
        Crea tu cuenta para publicar el comentario.
      </p>

      <div v-if="auth.isAuthenticated" class="mt-6 space-y-4" role="status">
        <p class="text-slate-800">
          Sesión iniciada como <strong>{{ auth.nick }}</strong>.
        </p>
        <div class="flex flex-wrap gap-3 text-sm">
          <RouterLink to="/cuenta" class="rounded-md bg-brand px-4 py-2 font-semibold text-white">Ver perfil</RouterLink>
          <button type="button" class="rounded-md border border-slate-200 px-4 py-2 font-medium" :disabled="auth.loading" @click="logout">
            Salir
          </button>
        </div>
      </div>

      <form v-else class="mt-6 space-y-4" novalidate @submit.prevent="submit">
        <div class="grid grid-cols-2 gap-2 rounded-lg bg-canvas p-1" role="tablist" aria-label="Acceso">
          <button
            type="button"
            role="tab"
            class="rounded-md px-3 py-2 text-sm font-medium"
            :class="mode === 'register' ? 'bg-white text-brand shadow-sm' : 'text-slate-600'"
            :aria-selected="mode === 'register'"
            @click="choose('register')"
          >
            Crear cuenta
          </button>
          <button
            type="button"
            role="tab"
            class="rounded-md px-3 py-2 text-sm font-medium"
            :class="mode === 'login' ? 'bg-white text-brand shadow-sm' : 'text-slate-600'"
            :aria-selected="mode === 'login'"
            @click="choose('login')"
          >
            Ingresar
          </button>
        </div>

        <div v-if="mode === 'register'">
          <label class="text-sm font-medium" for="nombre">Nombre</label>
          <input
            id="nombre"
            v-model="name"
            name="name"
            type="text"
            autocomplete="name"
            maxlength="80"
            required
            class="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand"
            :aria-invalid="Boolean(fieldMessage('name'))"
          />
          <p v-if="fieldMessage('name')" class="mt-1 text-sm text-red-700">{{ fieldMessage('name') }}</p>
        </div>

        <div v-if="mode === 'register'">
          <label class="text-sm font-medium" for="correo">Correo</label>
          <input
            id="correo"
            v-model="email"
            name="email"
            type="email"
            autocomplete="email"
            maxlength="160"
            required
            class="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand"
            :aria-invalid="Boolean(fieldMessage('email'))"
          />
          <p v-if="fieldMessage('email')" class="mt-1 text-sm text-red-700">{{ fieldMessage('email') }}</p>
        </div>

        <div>
          <label class="text-sm font-medium" for="nick">Nick</label>
          <input
            id="nick"
            v-model="nick"
            name="nick"
            type="text"
            autocomplete="username"
            minlength="3"
            maxlength="20"
            required
            class="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand"
            :aria-invalid="Boolean(fieldMessage('nick'))"
            :aria-describedby="fieldMessage('nick') ? 'nick-error' : undefined"
          />
          <p v-if="fieldMessage('nick')" id="nick-error" class="mt-1 text-sm text-red-700">
            {{ fieldMessage('nick') }}
          </p>
        </div>

        <div v-if="mode === 'register'">
          <label class="text-sm font-medium" for="departamento">Departamento</label>
          <select
            id="departamento"
            v-model="department"
            name="department"
            required
            class="mt-1 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand"
            :aria-invalid="Boolean(fieldMessage('department'))"
          >
            <option value="" disabled>Elige un departamento</option>
            <option v-for="item in departments" :key="item" :value="item">{{ item }}</option>
          </select>
          <p v-if="fieldMessage('department')" class="mt-1 text-sm text-red-700">{{ fieldMessage('department') }}</p>
        </div>

        <div v-if="mode === 'register'">
          <label class="text-sm font-medium" for="municipio">Municipio</label>
          <select
            id="municipio"
            v-model="municipality"
            name="municipality"
            required
            :disabled="municipalityOptions.length === 0"
            class="mt-1 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand disabled:bg-slate-50"
            :aria-invalid="Boolean(fieldMessage('municipality'))"
          >
            <option value="" disabled>{{ municipalityOptions.length === 0 ? 'Elige primero un departamento' : 'Elige un municipio' }}</option>
            <option v-for="item in municipalityOptions" :key="item" :value="item">{{ item }}</option>
          </select>
          <p v-if="fieldMessage('municipality')" class="mt-1 text-sm text-red-700">{{ fieldMessage('municipality') }}</p>
        </div>

        <div v-if="mode === 'register'">
          <label class="text-sm font-medium" for="nacimiento">Año de nacimiento</label>
          <input
            id="nacimiento"
            v-model="birthYear"
            name="birth_year"
            type="number"
            inputmode="numeric"
            min="1900"
            :max="adultYear"
            required
            class="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand"
            :aria-invalid="Boolean(fieldMessage('birth_year'))"
          />
          <p v-if="fieldMessage('birth_year')" class="mt-1 text-sm text-red-700">{{ fieldMessage('birth_year') }}</p>
        </div>

        <div>
          <label class="text-sm font-medium" for="clave">Contraseña</label>
          <input
            id="clave"
            v-model="password"
            name="password"
            type="password"
            :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
            minlength="8"
            maxlength="80"
            required
            class="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand"
            :aria-invalid="Boolean(fieldMessage('password'))"
          />
          <p v-if="fieldMessage('password')" class="mt-1 text-sm text-red-700">{{ fieldMessage('password') }}</p>
        </div>

        <div v-if="mode === 'register'">
          <label class="text-sm font-medium" for="clave-confirma">Confirmar contraseña</label>
          <input
            id="clave-confirma"
            v-model="passwordConfirmation"
            name="password_confirmation"
            type="password"
            autocomplete="new-password"
            minlength="8"
            maxlength="80"
            required
            class="mt-1 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand"
            :aria-invalid="Boolean(fieldMessage('password_confirmation'))"
          />
          <p v-if="fieldMessage('password_confirmation')" class="mt-1 text-sm text-red-700">{{ fieldMessage('password_confirmation') }}</p>
        </div>

        <div v-if="mode === 'register'" class="space-y-3 text-sm">
          <label class="flex items-start gap-2" for="consent-terms">
            <input id="consent-terms" v-model="consentTerms" type="checkbox" class="mt-1" />
            <span>
              Acepto los
              <RouterLink to="/terminos" class="font-medium text-brand underline" @click.stop>términos de participación</RouterLink>.
            </span>
          </label>
          <p v-if="fieldMessage('consent_terms')" class="text-sm text-red-700">
            {{ fieldMessage('consent_terms') }}
          </p>
          <label class="flex items-start gap-2" for="consent-metrics">
            <input id="consent-metrics" v-model="consentMetrics" type="checkbox" class="mt-1" />
            <span>
              Acepto el perfil de métricas de mi participación. Es opcional y se explica en la
              <RouterLink to="/privacidad" class="font-medium text-brand underline" @click.stop>política de privacidad</RouterLink>.
            </span>
          </label>
        </div>

        <p v-if="auth.error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {{ auth.error }}
        </p>

        <button type="submit" class="h-11 w-full rounded-md bg-brand text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-60" :disabled="auth.loading">
          {{ auth.loading ? 'Enviando...' : mode === 'register' ? 'Crear cuenta' : 'Ingresar' }}
        </button>
      </form>
    </div>
  </section>
</template>
