<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import DebateCard from '../components/debate/DebateCard.vue'
import { sendToRegister } from '../lib/accountGate'
import { useDebateStore } from '../stores/debates'

const route = useRoute()
const router = useRouter()
const debates = useDebateStore()
const notice = ref('')

const post = computed(() => debates.opened)

watch(
  () => route.params.id,
  (id) => {
    if (typeof id === 'string' && id.length > 0) {
      notice.value = ''
      void debates.open(id).then(() => debates.followThread(id))
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  debates.stopThread()
})

async function onLike(): Promise<void> {
  if (!post.value) {
    return
  }

  const result = await debates.toggleLike(post.value.id)
  if (!result.ok && result.message.length > 0) {
    notice.value = result.message
  }
}

async function onComment(body: string, done: (message: string | null) => void): Promise<void> {
  if (!post.value) {
    done('Este debate no está disponible.')
    return
  }

  const result = await debates.addComment(post.value.id, body)
  if (result.needsAccount) {
    sendToRegister(router, route)
    done(null)
    return
  }
  if (result.ok) {
    notice.value = result.message
    done(null)
    return
  }

  done(result.message)
}

async function onReply(commentId: string, body: string, done: (message: string | null) => void): Promise<void> {
  if (!post.value) {
    done('Este debate no está disponible.')
    return
  }

  const result = await debates.addReply(post.value.id, commentId, body)
  if (result.needsAccount) {
    sendToRegister(router, route)
    done(null)
    return
  }
  if (result.ok) {
    notice.value = result.message
    done(null)
    return
  }

  done(result.message)
}

async function onVote(commentId: string, stance: 'favor' | 'contra'): Promise<void> {
  if (!post.value) {
    return
  }

  const result = await debates.castVote(post.value.id, commentId, stance)
  if (!result.ok && result.message.length > 0) {
    notice.value = result.message
  }
}

async function onCommentLike(commentId: string): Promise<void> {
  if (!post.value) {
    return
  }

  const result = await debates.toggleCommentLike(post.value.id, commentId)
  if (!result.ok && result.message.length > 0) {
    notice.value = result.message
  }
}

async function share(): Promise<void> {
  if (!post.value) {
    return
  }

  void debates.share(post.value.id)
  try {
    await navigator.clipboard.writeText(`${window.location.origin}/debates/${post.value.id}`)
    notice.value = 'Enlace del debate copiado.'
  } catch {
    notice.value = 'No se pudo copiar el enlace en este navegador.'
  }
}
</script>

<template>
  <div class="mx-auto w-full min-w-0 max-w-2xl px-3 py-4 sm:px-4">
    <RouterLink to="/debates" class="text-sm font-medium text-brand">Volver al feed</RouterLink>

    <p v-if="notice" class="mt-3 rounded-lg bg-white px-4 py-2 text-sm text-slate-700 shadow-sm" role="status">
      {{ notice }}
    </p>

    <p v-if="debates.detailLoading && !post" class="mt-4 rounded-xl bg-white p-6 text-sm text-slate-600" role="status">
      Cargando el debate...
    </p>

    <p v-else-if="debates.detailError" class="mt-4 rounded-xl bg-white p-6 text-sm text-slate-600" role="status">
      {{ debates.detailError }}
    </p>

    <div v-else-if="post" class="mt-4">
      <DebateCard
        :post="post"
        open-thread
        @like="onLike"
        @share="share"
        @comment="onComment"
        @reply="onReply"
        @vote="onVote"
        @like-comment="onCommentLike"
      />
    </div>
  </div>
</template>
