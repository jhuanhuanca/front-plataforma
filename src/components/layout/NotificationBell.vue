<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchNotices, markNoticeRead, type ActivityNotice } from '../../api/notices'
import { fetchStanding } from '../../api/standing'
import AppIcon from '../ui/AppIcon.vue'

const router = useRouter()
const root = ref<HTMLElement | null>(null)
const open = ref(false)
const items = ref<ActivityNotice[]>([])
const unread = ref(0)
const silenced = ref(false)
const silencedUntil = ref<string | null>(null)
let timer = 0

function label(item: ActivityNotice): string {
  if (item.kind === 'reply') {
    return `${item.author_nick} respondió tu argumento.`
  }

  return `${item.author_nick} dejó un argumento en tu debate.`
}

async function load(): Promise<void> {
  try {
    const result = await fetchNotices()
    items.value = result.items
    unread.value = result.unread
  } catch {
    return
  }

  try {
    const standing = await fetchStanding()
    silenced.value = standing.silenced
    silencedUntil.value = standing.until
  } catch {
    silenced.value = false
  }
}

function onDocumentClick(event: MouseEvent): void {
  if (!root.value?.contains(event.target as Node)) {
    open.value = false
  }
}

async function openNotice(item: ActivityNotice): Promise<void> {
  if (!item.read) {
    try {
      unread.value = await markNoticeRead(item.id)
      item.read = true
    } catch {
      return
    }
  }

  open.value = false
  if (item.debate_id !== null) {
    await router.push(`/debates/${item.debate_id}`)
  }
}

onMounted(() => {
  void load()
  timer = window.setInterval(() => {
    void load()
  }, 15000)
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  window.clearInterval(timer)
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="relative grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-700 md:h-9 md:w-9 md:rounded-full md:bg-transparent"
      :aria-expanded="open"
      aria-haspopup="dialog"
      aria-label="Avisos"
      @click="open = !open"
    >
      <AppIcon name="bell" class="h-5 w-5" />
      <span
        v-if="silenced"
        class="absolute left-1 top-1 h-2.5 w-2.5 rounded-full bg-amber-500"
      />
      <span
        v-if="unread > 0"
        class="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white"
      >
        {{ unread > 9 ? '9+' : unread }}
      </span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-12 z-40 w-72 rounded-xl bg-white p-2 text-left shadow-lg ring-1 ring-slate-200"
      role="dialog"
      aria-label="Avisos"
    >
      <p v-if="silenced" class="px-2 py-2 text-sm text-amber-900">
        Tu cuenta está silenciada{{ silencedUntil ? ` hasta el ${silencedUntil}` : '' }}. Puedes seguir leyendo y borrar la cuenta.
      </p>
      <p v-if="items.length === 0" class="px-2 py-3 text-sm text-slate-600">No hay avisos.</p>
      <ul v-else class="max-h-80 space-y-1 overflow-y-auto">
        <li v-for="item in items" :key="item.id">
          <button
            type="button"
            class="w-full rounded-lg px-2 py-2 text-left text-sm text-slate-800 hover:bg-slate-50"
            :class="item.read ? 'text-slate-500' : 'font-medium'"
            @click="openNotice(item)"
          >
            {{ label(item) }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
