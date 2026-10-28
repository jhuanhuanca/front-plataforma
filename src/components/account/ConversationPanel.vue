<script setup lang="ts">
import axios from 'axios'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import AppIcon from '../ui/AppIcon.vue'
import {
  conversationError,
  fetchConversations,
  fetchMessages,
  openConversation,
  sendMessage,
  type ConversationItem,
  type DirectMessageItem,
} from '../../api/conversations'

const props = defineProps<{
  nick: string
  request: number
}>()

const conversations = ref<ConversationItem[]>([])
const messages = ref<DirectMessageItem[]>([])
const activeId = ref<number | null>(null)
const activeNick = ref('')
const draftNick = ref('')
const draft = ref('')
const error = ref('')
const sending = ref(false)
const open = ref(false)

let listTimer = 0
let messageTimer = 0
let listBusy = false
let messageBusy = false
let pauseUntil = 0

watch(
  () => props.request,
  (request) => {
    if (request === 0 || props.nick.trim().length === 0) {
      return
    }

    draftNick.value = props.nick
    open.value = true
    void start(props.nick)
  },
)

onMounted(() => {
  void refreshList()
  listTimer = window.setInterval(() => {
    void refreshList()
  }, 4000)
  document.addEventListener('visibilitychange', onVisible)
})

onUnmounted(() => {
  window.clearInterval(listTimer)
  window.clearInterval(messageTimer)
  document.removeEventListener('visibilitychange', onVisible)
})

function onVisible(): void {
  if (!document.hidden) {
    void refreshList()
    void pullMessages()
  }
}

async function refreshList(): Promise<void> {
  if (listBusy || document.hidden || Date.now() < pauseUntil) {
    return
  }

  listBusy = true
  try {
    conversations.value = await fetchConversations()
  } catch (cause) {
    pause(cause)
  } finally {
    listBusy = false
  }
}

async function start(nick: string): Promise<void> {
  const target = nick.trim()
  if (!/^[A-Za-z0-9_]{3,20}$/.test(target)) {
    error.value = 'El nick solo puede tener letras, números y guion bajo.'
    return
  }

  error.value = ''
  try {
    const conversation = await openConversation(target)
    remember(conversation)
    await loadThread(conversation.id, conversation.nick ?? target)
  } catch (cause) {
    error.value = conversationError(cause)
  }
}

async function loadThread(id: number, nick: string): Promise<void> {
  activeId.value = id
  activeNick.value = nick
  messages.value = []
  window.clearInterval(messageTimer)
  await pullMessages(true)
  messageTimer = window.setInterval(() => {
    void pullMessages()
  }, 2000)
}

async function pullMessages(reset = false): Promise<void> {
  const id = activeId.value
  if (id === null || messageBusy || document.hidden || Date.now() < pauseUntil) {
    return
  }

  messageBusy = true
  try {
    let after = reset ? 0 : messages.value.reduce((cursor, message) => Math.max(cursor, message.id), 0)
    if (reset) {
      messages.value = []
    }

    for (let round = 0; round < 4; round += 1) {
      if (activeId.value !== id) {
        return
      }

      const page = await fetchMessages(id, after)
      for (const message of page.items) {
        if (!messages.value.some((item) => item.id === message.id)) {
          messages.value.push(message)
        }
      }

      if (!page.more || page.latest <= after) {
        break
      }

      after = page.latest
    }
  } catch (cause) {
    pause(cause)
  } finally {
    messageBusy = false
  }
}

async function submitNick(): Promise<void> {
  await start(draftNick.value)
}

async function submitMessage(): Promise<void> {
  const id = activeId.value
  const text = draft.value.trim()
  if (id === null || text.length === 0 || sending.value) {
    return
  }

  sending.value = true
  error.value = ''
  try {
    const message = await sendMessage(id, text)
    if (!messages.value.some((item) => item.id === message.id)) {
      messages.value.push(message)
    }
    draft.value = ''
    await refreshList()
  } catch (cause) {
    error.value = conversationError(cause)
  } finally {
    sending.value = false
  }
}

function remember(conversation: ConversationItem): void {
  const index = conversations.value.findIndex((item) => item.id === conversation.id)
  if (index >= 0) {
    conversations.value.splice(index, 1, conversation)
    return
  }

  conversations.value.unshift(conversation)
}

function pause(cause: unknown): void {
  if (axios.isAxiosError(cause) && cause.response?.status === 429) {
    pauseUntil = Date.now() + 15000
  }
}

async function choose(conversation: ConversationItem): Promise<void> {
  await loadThread(conversation.id, conversation.nick ?? '')
}

function closeBox(): void {
  open.value = false
  window.clearInterval(messageTimer)
  messageTimer = 0
}

function reopen(): void {
  open.value = true
  if (activeId.value !== null) {
    window.clearInterval(messageTimer)
    void pullMessages()
    messageTimer = window.setInterval(() => {
      void pullMessages()
    }, 2000)
  }
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-40 flex w-[min(100vw-2rem,22rem)] flex-col items-end">
    <section
      v-if="open"
      id="conversaciones"
      class="mb-3 flex max-h-[min(70vh,32rem)] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
    >
      <header class="flex items-center justify-between bg-brand px-4 py-3 text-white">
        <h2 class="text-sm font-semibold">Conversaciones</h2>
        <button type="button" class="rounded-md px-2 py-1 text-sm hover:bg-white/15" @click="closeBox">
          Cerrar
        </button>
      </header>
      <div class="min-h-0 flex-1 overflow-y-auto p-3">
        <form class="flex gap-2" @submit.prevent="submitNick">
          <label class="sr-only" for="nick-conversacion">Nick</label>
          <input
            id="nick-conversacion"
            v-model="draftNick"
            type="text"
            maxlength="20"
            placeholder="nick"
            class="h-10 min-w-0 flex-1 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-brand"
          />
          <button type="submit" class="rounded-md bg-brand px-3 text-sm font-semibold text-white">Abrir</button>
        </form>

        <ul v-if="conversations.length > 0" class="mt-3 flex gap-2 overflow-x-auto pb-1">
          <li v-for="conversation in conversations" :key="conversation.id" class="shrink-0">
            <button
              type="button"
              class="rounded-full px-3 py-1 text-sm"
              :class="conversation.id === activeId ? 'bg-brand text-white' : 'bg-canvas text-slate-700'"
              @click="choose(conversation)"
            >
              {{ conversation.nick }}
            </button>
          </li>
        </ul>

        <div v-if="activeId !== null" class="mt-3 border-t border-slate-100 pt-3">
          <h3 class="text-sm font-semibold">Con {{ activeNick }}</h3>
          <ul class="mt-2 max-h-52 space-y-2 overflow-y-auto">
            <li
              v-for="message in messages"
              :key="message.id"
              class="max-w-[85%] rounded-xl px-3 py-2 text-sm"
              :class="message.mine ? 'ml-auto bg-brand text-white' : 'bg-canvas text-slate-800'"
            >
              {{ message.body }}
            </li>
          </ul>
          <p v-if="messages.length === 0" class="mt-2 text-sm text-slate-500">Esta conversación está vacía.</p>
          <form class="mt-3 flex gap-2" @submit.prevent="submitMessage">
            <label class="sr-only" for="texto-conversacion">Mensaje</label>
            <input
              id="texto-conversacion"
              v-model="draft"
              type="text"
              maxlength="1000"
              placeholder="Escribe un mensaje"
              class="h-10 min-w-0 flex-1 rounded-full border border-slate-200 px-3 text-sm outline-none focus:border-brand"
            />
            <button type="submit" class="rounded-full bg-brand px-3 text-sm font-semibold text-white" :disabled="sending">
              Enviar
            </button>
          </form>
        </div>
        <p v-else class="mt-3 text-sm text-slate-500">Elige un nick para conversar.</p>
        <p v-if="error" class="mt-2 text-sm text-red-700" role="alert">{{ error }}</p>
      </div>
    </section>

    <button
      v-else
      type="button"
      class="grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-lg ring-4 ring-white"
      aria-label="Abrir conversaciones"
      @click="reopen"
    >
      <AppIcon name="message" class="h-6 w-6" />
    </button>
  </div>
</template>
