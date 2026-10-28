<script setup lang="ts">
import { ref } from 'vue'
import type { DebateComment, DebatePost } from '../../data/debates'
import AppIcon from '../ui/AppIcon.vue'
import ArgumentBody from './ArgumentBody.vue'
import ArgumentVotes from './ArgumentVotes.vue'
import ReportControl from '../moderation/ReportControl.vue'

const props = withDefaults(defineProps<{
  post: DebatePost
  threadTo?: string
  openThread?: boolean
}>(), {
  threadTo: '',
  openThread: false,
})

const emit = defineEmits<{
  like: []
  share: []
  comment: [body: string, done: (message: string | null) => void]
  reply: [commentId: string, body: string, done: (message: string | null) => void]
  likeComment: [commentId: string]
  vote: [commentId: string, stance: 'favor' | 'contra']
}>()

const draft = ref('')
const error = ref('')
const replyingTo = ref('')
const replyDraft = ref('')
const replyError = ref('')
const openReplies = ref<Record<string, boolean>>({})
const preview = ref(false)

function publish(): void {
  if (draft.value.trim().length === 0) {
    error.value = 'Escribe un comentario antes de publicarlo.'
    return
  }

  error.value = ''
  emit('comment', draft.value, (message) => {
    if (message === null) {
      draft.value = ''
      return
    }

    error.value = message
  })
}

function repliesVisible(id: string): boolean {
  const stored = openReplies.value[id]
  if (stored !== undefined) {
    return stored
  }

  return props.openThread
}

function toggleReplies(id: string): void {
  openReplies.value = { ...openReplies.value, [id]: !repliesVisible(id) }
}

function startReply(id: string): void {
  replyingTo.value = id
  replyError.value = ''
}

function sendReply(comment: DebateComment): void {
  if (replyDraft.value.trim().length === 0) {
    replyError.value = 'Escribe una respuesta antes de publicarla.'
    return
  }

  replyError.value = ''
  emit('reply', comment.id, replyDraft.value, (message) => {
    if (message === null) {
      replyDraft.value = ''
      replyingTo.value = ''
      openReplies.value = { ...openReplies.value, [comment.id]: true }
      return
    }

    replyError.value = message
  })
}

function replyCount(comment: DebateComment): number {
  return comment.replies.length
}
</script>

<template>
  <article class="min-w-0 max-w-full overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80">
    <header class="flex items-start gap-3">
      <img :src="post.avatar" alt="" class="h-11 w-11 rounded-full object-cover" />
      <div class="min-w-0 flex-1">
        <h2 class="text-sm font-semibold text-slate-900">
          <RouterLink v-if="threadTo" :to="threadTo" class="hover:text-brand">{{ post.author }}</RouterLink>
          <template v-else>{{ post.author }}</template>
        </h2>
        <p class="text-xs text-slate-500">
          {{ post.role }} · {{ post.time }}
          <span v-if="post.featured" class="ml-2 font-medium text-brand">Destacado</span>
          <span v-if="post.closed" class="ml-2 font-medium text-slate-700">Cerrado</span>
        </p>
      </div>
      <button type="button" class="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-canvas" aria-label="Más acciones">
        <AppIcon name="more" class="h-5 w-5" />
      </button>
    </header>

    <div class="mt-3 text-[15px] leading-relaxed text-slate-800">
      <ArgumentBody :text="post.body" />
    </div>

    <div v-if="post.image" class="relative mt-3 overflow-hidden rounded-lg bg-slate-200">
      <img :src="post.image" alt="" class="max-h-80 w-full max-w-full object-cover" loading="lazy" />
      <button
        v-if="post.kind === 'video'"
        type="button"
        class="absolute inset-0 grid place-items-center"
        :aria-pressed="preview"
        aria-label="Reproducir vista previa"
        @click="preview = !preview"
      >
        <span class="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-brand shadow">
          <AppIcon name="play" class="h-8 w-8" />
        </span>
      </button>
      <p v-if="preview" class="absolute inset-x-3 bottom-3 rounded-md bg-white/95 px-3 py-2 text-sm">
        Vista previa. El video se publicará cuando la fuente esté verificada.
      </p>
    </div>

    <div class="mt-3 flex min-w-0 flex-col gap-2 border-b border-slate-100 pb-3 text-xs text-slate-600 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:text-sm">
      <div class="flex min-w-0 flex-wrap gap-x-4 gap-y-1">
        <button v-if="!post.closed" type="button" class="inline-flex items-center gap-1" :class="post.liked ? 'text-brand' : ''" :aria-pressed="post.liked" @click="emit('like')">
          <AppIcon name="like" class="h-4 w-4" />
          Me gusta ({{ post.likes }})
        </button>
        <span v-else class="inline-flex items-center gap-1">
          <AppIcon name="like" class="h-4 w-4" />
          Me gusta ({{ post.likes }})
        </span>
        <span class="inline-flex items-center gap-1">
          <AppIcon name="comment" class="h-4 w-4" />
          Comentarios ({{ post.comments.length }})
        </span>
        <RouterLink v-if="threadTo" :to="threadTo" class="font-medium text-brand">Ver hilo</RouterLink>
        <ReportControl target-type="debate" :target-id="post.id" />
      </div>
      <button type="button" class="inline-flex items-center gap-1 hover:text-slate-900" @click="emit('share')">
        <AppIcon name="share" class="h-4 w-4" />
        Compartir ({{ post.shares }})
      </button>
    </div>

    <p v-if="post.closed" class="mt-3 text-sm text-slate-600">Este debate está cerrado.</p>
    <form v-else class="mt-3 flex items-center gap-2" @submit.prevent="publish">
      <img
        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=70"
        alt=""
        class="h-9 w-9 rounded-full object-cover"
      />
      <label class="sr-only" :for="`comentario-${post.id}`">Añadir un comentario</label>
      <input
        :id="`comentario-${post.id}`"
        v-model="draft"
        type="text"
        placeholder="Añadir un comentario..."
        class="h-10 min-w-0 flex-1 rounded-full bg-canvas px-4 text-sm outline-none ring-brand focus:ring-2"
      />
      <button type="submit" class="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-canvas sm:hidden" aria-label="Publicar comentario">
        <AppIcon name="send" class="h-5 w-5" />
      </button>
      <button type="submit" class="hidden rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-deep sm:inline">
        Publicación
      </button>
    </form>
    <p v-if="error" class="mt-2 text-sm text-red-700" role="alert">{{ error }}</p>

    <ul class="mt-4 space-y-4">
      <li v-for="comment in post.comments" :key="comment.id">
        <div class="flex gap-3">
          <img :src="comment.avatar" alt="" class="h-9 w-9 rounded-full object-cover" />
          <div class="min-w-0 flex-1">
            <div class="rounded-xl bg-canvas px-3 py-2">
              <p class="text-sm">
                <span class="font-semibold">{{ comment.author }}</span>
                <span class="ml-2 text-xs text-slate-500">{{ comment.time }}</span>
              </p>
              <div class="mt-1 text-sm text-slate-700">
                <ArgumentBody :text="comment.body" />
              </div>
            </div>
            <div class="mt-1 flex flex-wrap gap-3 px-2 text-xs text-slate-500">
              <ArgumentVotes
                v-if="!post.closed"
                :favor="comment.favor"
                :contra="comment.contra"
                :stance="comment.stance"
                @vote="emit('vote', comment.id, $event)"
              />
              <span v-else>A favor ({{ comment.favor }}) · En contra ({{ comment.contra }})</span>
              <button v-if="!post.closed" type="button" :class="comment.liked ? 'text-brand' : ''" :aria-pressed="comment.liked" @click="emit('likeComment', comment.id)">
                Me gusta ({{ comment.likes }})
              </button>
              <span v-else>Me gusta ({{ comment.likes }})</span>
              <button v-if="!post.closed" type="button" @click="startReply(comment.id)">Responder</button>
              <ReportControl target-type="argument" :target-id="comment.id" />
              <button v-if="replyCount(comment) > 0" type="button" @click="toggleReplies(comment.id)">
                {{ repliesVisible(comment.id) ? 'Ocultar respuestas' : replyCount(comment) === 1 ? 'Ver 1 respuesta' : `Ver ${replyCount(comment)} respuestas` }}
              </button>
            </div>
            <form v-if="!post.closed && replyingTo === comment.id" class="mt-2 flex items-center gap-2" @submit.prevent="sendReply(comment)">
              <label class="sr-only" :for="`respuesta-${comment.id}`">Responder a {{ comment.author }}</label>
              <input
                :id="`respuesta-${comment.id}`"
                v-model="replyDraft"
                type="text"
                placeholder="Escribe una respuesta..."
                class="h-9 min-w-0 flex-1 rounded-full bg-white px-3 text-sm outline-none ring-brand focus:ring-2"
              />
              <button type="submit" class="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-deep">
                Responder
              </button>
            </form>
            <p v-if="replyingTo === comment.id && replyError" class="mt-1 text-xs text-red-700" role="alert">{{ replyError }}</p>
            <ul v-if="repliesVisible(comment.id)" class="mt-3 space-y-3 pl-2">
              <li v-for="reply in comment.replies" :key="reply.id" class="flex gap-2">
                <img :src="reply.avatar" alt="" class="h-8 w-8 rounded-full object-cover" />
                <div class="rounded-xl bg-canvas px-3 py-2">
                  <p class="text-sm font-semibold">
                    {{ reply.author }}
                    <span class="ml-2 text-xs font-normal text-slate-500">{{ reply.time }}</span>
                  </p>
                  <div class="text-sm text-slate-700">
                    <ArgumentBody :text="reply.body" />
                  </div>
                  <div class="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                    <ArgumentVotes
                      v-if="!post.closed"
                      :favor="reply.favor"
                      :contra="reply.contra"
                      :stance="reply.stance"
                      @vote="emit('vote', reply.id, $event)"
                    />
                    <span v-else>A favor ({{ reply.favor }}) · En contra ({{ reply.contra }})</span>
                    <button
                      v-if="!post.closed"
                      type="button"
                      :class="reply.liked ? 'text-brand' : 'text-slate-500'"
                      :aria-pressed="reply.liked"
                      @click="emit('likeComment', reply.id)"
                    >
                      Me gusta ({{ reply.likes }})
                    </button>
                    <span v-else>Me gusta ({{ reply.likes }})</span>
                    <ReportControl target-type="argument" :target-id="reply.id" />
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </li>
    </ul>
  </article>
</template>
