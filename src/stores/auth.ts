import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { deleteAccount as deleteAccountRequest, firstApiMessage, loginAccount, logoutAccount, readApiErrors, registerAccount, type AuthUser, type RegisterPayload } from '../api/auth'
import { ensureDeviceFingerprint } from '../lib/deviceFingerprint'

const tokenKey = 'auth_token'
const nickKey = 'auth_nick'
const userKey = 'auth_user_id'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(tokenKey))
  const nick = ref<string | null>(localStorage.getItem(nickKey))
  const userId = ref<string | null>(localStorage.getItem(userKey))
  const loading = ref(false)
  const error = ref('')
  const fieldErrors = ref<Record<string, string[]>>({})

  const isAuthenticated = computed(() => token.value !== null && nick.value !== null)

  function persist(user: AuthUser, nextToken: string): void {
    token.value = nextToken
    nick.value = user.nick
    userId.value = String(user.id)
    localStorage.setItem(tokenKey, nextToken)
    localStorage.setItem(nickKey, user.nick)
    localStorage.setItem(userKey, String(user.id))
  }

  function clearSession(): void {
    token.value = null
    nick.value = null
    userId.value = null
    localStorage.removeItem(tokenKey)
    localStorage.removeItem(nickKey)
    localStorage.removeItem(userKey)
  }

  function applyError(cause: unknown): void {
    if (!axios.isAxiosError(cause) || !cause.response) {
      error.value = 'No se pudo conectar con el servidor.'
      return
    }

    fieldErrors.value = readApiErrors(cause)
    error.value = firstApiMessage(fieldErrors.value)
  }

  async function register(payload: RegisterPayload): Promise<boolean> {
    loading.value = true
    error.value = ''
    fieldErrors.value = {}

    try {
      await ensureDeviceFingerprint()
      const session = await registerAccount(payload)
      persist(session.user, session.token)
      return true
    } catch (cause) {
      applyError(cause)
      return false
    } finally {
      loading.value = false
    }
  }

  async function login(nickValue: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = ''
    fieldErrors.value = {}

    try {
      await ensureDeviceFingerprint()
      const session = await loginAccount(nickValue.trim(), password)
      persist(session.user, session.token)
      return true
    } catch (cause) {
      applyError(cause)
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    loading.value = true
    error.value = ''

    try {
      await ensureDeviceFingerprint()
      if (token.value) {
        await logoutAccount()
      }
    } catch {
      error.value = ''
    } finally {
      clearSession()
      loading.value = false
    }
  }

  async function removeAccount(nickValue: string): Promise<boolean> {
    loading.value = true
    error.value = ''
    fieldErrors.value = {}

    try {
      await ensureDeviceFingerprint()
      await deleteAccountRequest(nickValue.trim())
      clearSession()
      return true
    } catch (cause) {
      applyError(cause)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    token,
    nick,
    userId,
    loading,
    error,
    fieldErrors,
    isAuthenticated,
    register,
    login,
    logout,
    removeAccount,
    clearSession,
  }
})
