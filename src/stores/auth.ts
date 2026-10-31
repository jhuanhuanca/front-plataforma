import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { deleteAccount as deleteAccountRequest, firstApiMessage, loginAccount, logoutAccount, readApiErrors, registerAccount, updateAvatar, updateCover, type AuthUser, type RegisterPayload } from '../api/auth'
import { ensureDeviceFingerprint } from '../lib/deviceFingerprint'

const tokenKey = 'auth_token'
const nickKey = 'auth_nick'
const userKey = 'auth_user_id'
const avatarKey = 'auth_avatar'
const coverKey = 'auth_cover'
const joinedKey = 'auth_joined'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(tokenKey))
  const nick = ref<string | null>(localStorage.getItem(nickKey))
  const userId = ref<string | null>(localStorage.getItem(userKey))
  const avatar = ref<string | null>(localStorage.getItem(avatarKey))
  const cover = ref<string | null>(localStorage.getItem(coverKey))
  const joinedAt = ref<string | null>(localStorage.getItem(joinedKey))
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
    rememberAvatar(user.avatar)
    rememberCover(user.cover)
    rememberJoined(user.created_at)
  }

  function rememberAvatar(next: string | null | undefined): void {
    avatar.value = next && next !== '' ? next : null
    if (avatar.value) {
      localStorage.setItem(avatarKey, avatar.value)
      return
    }

    localStorage.removeItem(avatarKey)
  }

  function rememberCover(next: string | null | undefined): void {
    cover.value = next && next !== '' ? next : null
    if (cover.value) {
      localStorage.setItem(coverKey, cover.value)
      return
    }

    localStorage.removeItem(coverKey)
  }

  function rememberJoined(next: string | null | undefined): void {
    joinedAt.value = next && next !== '' ? next : null
    if (joinedAt.value) {
      localStorage.setItem(joinedKey, joinedAt.value)
      return
    }

    localStorage.removeItem(joinedKey)
  }

  function clearSession(): void {
    token.value = null
    nick.value = null
    userId.value = null
    avatar.value = null
    cover.value = null
    joinedAt.value = null
    localStorage.removeItem(tokenKey)
    localStorage.removeItem(nickKey)
    localStorage.removeItem(userKey)
    localStorage.removeItem(avatarKey)
    localStorage.removeItem(coverKey)
    localStorage.removeItem(joinedKey)
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

  async function changeAvatar(file: File): Promise<boolean> {
    loading.value = true
    error.value = ''
    fieldErrors.value = {}

    try {
      const user = await updateAvatar(file)
      rememberAvatar(user.avatar)
      return true
    } catch (cause) {
      applyError(cause)
      return false
    } finally {
      loading.value = false
    }
  }

  async function changeCover(file: File): Promise<boolean> {
    loading.value = true
    error.value = ''
    fieldErrors.value = {}

    try {
      const user = await updateCover(file)
      rememberCover(user.cover)
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
    avatar,
    cover,
    joinedAt,
    loading,
    error,
    fieldErrors,
    isAuthenticated,
    register,
    login,
    changeAvatar,
    changeCover,
    logout,
    removeAccount,
    clearSession,
  }
})
