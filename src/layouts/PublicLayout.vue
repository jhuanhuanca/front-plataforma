<script setup lang="ts">
import ConversationPanel from '../components/account/ConversationPanel.vue'
import ApiFailureNotice from '../components/layout/ApiFailureNotice.vue'
import OfflineNotice from '../components/layout/OfflineNotice.vue'
import TopBar from '../components/layout/TopBar.vue'
import { useAccountStore } from '../stores/account'
import { useAuthStore } from '../stores/auth'

const account = useAccountStore()
const auth = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-canvas text-ink">
    <a
      href="#contenido"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2"
    >
      Saltar al contenido
    </a>
    <TopBar />
    <OfflineNotice />
    <ApiFailureNotice />
    <main id="contenido" class="min-w-0 overflow-x-clip">
      <RouterView />
    </main>
    <ConversationPanel v-if="auth.isAuthenticated" :nick="account.chatNick" :request="account.chatRequest" />
    <footer class="px-4 py-6 text-center text-sm text-slate-500">
      <p class="font-semibold text-brand">EnAgenda</p>
      <p class="mt-1 text-xs text-ink">Comunidad Digital</p>
      <div class="mt-2">
        <RouterLink to="/terminos" class="underline">Términos</RouterLink>
        <span aria-hidden="true"> · </span>
        <RouterLink to="/privacidad" class="underline">Privacidad</RouterLink>
      </div>
    </footer>
  </div>
</template>
