import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { firstApiMessage, readApiErrors } from '../api/auth'
import {
  applyArgumentUpdates,
  applyFeedArguments,
  commentsCursor,
  createArgument,
  createDebate,
  debateCursor,
  debateFeedCursor,
  fetchDebate,
  fetchDebateUpdates,
  fetchDebates,
  fetchLiveArguments,
  fetchNewerDebates,
  shareDebate,
  toggleArgumentReaction,
  toggleDebateReaction,
  castArgumentVote,
} from '../api/debates'
import { posts, voices, type DebateComment, type DebatePost } from '../data/debates'

interface ActionResult {
  ok: boolean
  message: string
  needsAccount?: boolean
}

export const useDebateStore = defineStore('debates', () => {
  const items = ref<DebatePost[]>([])
  const following = ref<string[]>([])
  const query = ref('')
  const loading = ref(false)
  const loadError = ref('')
  const openedId = ref('')
  const detailLoading = ref(false)
  const detailError = ref('')
  const remote = ref(false)
  const opened = computed(() => items.value.find((post) => post.id === openedId.value) ?? null)
  const people = voices

  const visible = computed(() => {
    const text = query.value.trim().toLowerCase()
    if (text.length === 0) {
      return items.value
    }

    return items.value.filter((post) => {
      return post.body.toLowerCase().includes(text) || post.author.toLowerCase().includes(text)
    })
  })

  async function load(): Promise<void> {
    loading.value = true
    loadError.value = ''

    try {
      items.value = await fetchDebates()
      remote.value = true
    } catch {
      items.value = structuredClone(posts)
      remote.value = false
      loadError.value = 'No se pudo cargar el feed. Se muestran los debates de ejemplo.'
    } finally {
      loading.value = false
    }
  }

  async function toggleLike(id: string): Promise<ActionResult> {
    if (!remote.value) {
      flipPostLike(id)
      return { ok: true, message: '' }
    }

    if (!hasSession()) {
      return { ok: false, message: 'Entra para apoyar un argumento.' }
    }

    try {
      const state = await toggleDebateReaction(id)
      const post = items.value.find((item) => item.id === id)
      if (post) {
        post.likes = state.likes
        post.liked = state.liked
      }

      return { ok: true, message: '' }
    } catch (cause) {
      return { ok: false, message: failureMessage(cause) }
    }
  }

  async function share(id: string): Promise<void> {
    const post = items.value.find((item) => item.id === id)
    if (!post) {
      return
    }

    if (!remote.value || !hasSession()) {
      post.shares += 1
      return
    }

    try {
      post.shares = await shareDebate(id)
    } catch {
      post.shares += 1
    }
  }

  async function toggleCommentLike(postId: string, commentId: string): Promise<ActionResult> {
    if (!remote.value) {
      const comment = findComment(postId, commentId)
      if (comment) {
        comment.liked = !comment.liked
        comment.likes += comment.liked ? 1 : -1
      }

      return { ok: true, message: '' }
    }

    if (!hasSession()) {
      return { ok: false, message: 'Entra para apoyar un comentario.' }
    }

    try {
      const state = await toggleArgumentReaction(commentId)
      const comment = findComment(postId, commentId)
      if (comment) {
        comment.likes = state.likes
        comment.liked = state.liked
      }

      return { ok: true, message: '' }
    } catch (cause) {
      return { ok: false, message: failureMessage(cause) }
    }
  }

  async function castVote(postId: string, commentId: string, stance: 'favor' | 'contra'): Promise<ActionResult> {
    const comment = findComment(postId, commentId)
    if (!comment) {
      return { ok: false, message: 'Ese comentario ya no está en el hilo.' }
    }

    if (!remote.value) {
      applyLocalVote(comment, stance)
      return { ok: true, message: '' }
    }

    if (!hasSession()) {
      return { ok: false, message: 'Entra para votar este argumento.' }
    }

    try {
      const state = await castArgumentVote(commentId, stance)
      comment.favor = state.favor
      comment.contra = state.contra
      comment.stance = state.stance

      return { ok: true, message: '' }
    } catch (cause) {
      return { ok: false, message: failureMessage(cause) }
    }
  }

  async function addComment(postId: string, body: string): Promise<ActionResult> {
    const text = body.trim()
    if (text.length === 0) {
      return { ok: false, message: 'Escribe un comentario antes de publicarlo.' }
    }

    if (!hasSession()) {
      return { ok: false, message: 'Crea una cuenta para comentar.', needsAccount: true }
    }

    if (!remote.value) {
      pushLocalComment(postId, text)
      return { ok: true, message: 'Comentario publicado en este navegador.' }
    }

    try {
      const comment = await createArgument(postId, text)
      const post = items.value.find((item) => item.id === postId)
      post?.comments.unshift(comment)

      return { ok: true, message: 'Comentario publicado.' }
    } catch (cause) {
      return { ok: false, message: failureMessage(cause) }
    }
  }

  async function open(id: string): Promise<void> {
    openedId.value = id
    detailLoading.value = true
    detailError.value = ''

    try {
      const post = await fetchDebate(id)
      remote.value = true
      const index = items.value.findIndex((item) => item.id === post.id)
      if (index >= 0) {
        items.value[index] = post
      } else {
        items.value.unshift(post)
      }
    } catch (cause) {
      const cached = items.value.some((item) => item.id === id)
      if (!cached) {
        detailError.value = axios.isAxiosError(cause) && cause.response?.status === 404
          ? 'Este debate no está disponible.'
          : 'No se pudo abrir el debate.'
      }
    } finally {
      detailLoading.value = false
    }
  }

  async function addReply(postId: string, commentId: string, body: string): Promise<ActionResult> {
    const text = body.trim()
    if (text.length === 0) {
      return { ok: false, message: 'Escribe una respuesta antes de publicarla.' }
    }

    const post = items.value.find((item) => item.id === postId)
    const comment = post?.comments.find((item) => item.id === commentId)
    if (!comment) {
      return { ok: false, message: 'Ese comentario ya no está en el hilo.' }
    }

    if (!hasSession()) {
      return { ok: false, message: 'Crea una cuenta para responder.', needsAccount: true }
    }

    if (!remote.value) {
      comment.replies.push({
        id: `local-${Date.now()}`,
        author: 'Tú',
        avatar: avatarFallback(),
        time: 'ahora',
        body: text,
        likes: 0,
        liked: false,
        favor: 0,
        contra: 0,
        stance: null,
        replies: [],
      })

      return { ok: true, message: 'Respuesta publicada en este navegador.' }
    }

    try {
      const reply = await createArgument(postId, text, commentId)
      comment.replies.push(reply)

      return { ok: true, message: 'Respuesta publicada.' }
    } catch (cause) {
      return { ok: false, message: failureMessage(cause) }
    }
  }

  async function addPost(body: string): Promise<ActionResult> {
    const text = body.trim()
    if (text.length < 8) {
      return { ok: false, message: 'El argumento necesita al menos 8 caracteres.' }
    }

    if (!hasSession()) {
      return { ok: false, message: 'Crea una cuenta para publicar.', needsAccount: true }
    }

    if (!remote.value) {
      pushLocalPost(text)
      return { ok: true, message: 'Argumento publicado en este navegador.' }
    }

    try {
      const post = await createDebate(text)
      items.value.unshift(post)

      return { ok: true, message: 'Argumento publicado en el feed.' }
    } catch (cause) {
      return { ok: false, message: failureMessage(cause) }
    }
  }

  function toggleFollow(id: string): void {
    if (following.value.includes(id)) {
      following.value = following.value.filter((item) => item !== id)
      return
    }

    following.value.push(id)
  }

  function flipPostLike(id: string): void {
    const post = items.value.find((item) => item.id === id)
    if (!post) {
      return
    }

    post.liked = !post.liked
    post.likes += post.liked ? 1 : -1
  }

  function pushLocalComment(postId: string, text: string): void {
    const post = items.value.find((item) => item.id === postId)
    if (!post) {
      return
    }

    post.comments.unshift({
      id: `local-${Date.now()}`,
      author: 'Tú',
      avatar: avatarFallback(),
      time: 'ahora',
      body: text,
      likes: 0,
      liked: false,
      favor: 0,
      contra: 0,
      stance: null,
      replies: [],
    })
  }

  function pushLocalPost(text: string): void {
    items.value.unshift({
      id: `post-${Date.now()}`,
      author: 'Tú',
      role: 'Participante',
      avatar: avatarFallback(),
      time: 'ahora',
      body: text,
      image: '',
      kind: 'image',
      likes: 0,
      shares: 0,
      liked: false,
      comments: [],
    })
  }

  let threadTimer = 0
  let feedTimer = 0
  let threadId = ''
  let threadBusy = false
  let feedBusy = false
  let threadPauseUntil = 0
  let feedPauseUntil = 0

  function followThread(id: string): void {
    stopThread()
    if (openedId.value !== id || !remote.value) {
      return
    }

    threadId = id

    threadTimer = window.setInterval(() => {
      void pullThread()
    }, 2000)
    document.addEventListener('visibilitychange', onThreadVisible)
    void pullThread()
  }

  function stopThread(): void {
    window.clearInterval(threadTimer)
    threadTimer = 0
    threadId = ''
    document.removeEventListener('visibilitychange', onThreadVisible)
  }

  function onThreadVisible(): void {
    if (!document.hidden) {
      void pullThread()
    }
  }

  async function pullThread(): Promise<void> {
    const id = threadId
    if (threadBusy || id === '' || document.hidden || Date.now() < threadPauseUntil || openedId.value !== id) {
      return
    }

    const post = items.value.find((item) => item.id === id)
    if (!post) {
      return
    }

    threadBusy = true
    try {
      let after = debateCursor(post)
      for (let round = 0; round < 4; round += 1) {
        if (threadId !== id) {
          return
        }

        const page = await fetchDebateUpdates(id, after)
        if (threadId !== id) {
          return
        }

        const applied = applyArgumentUpdates(post, page.items)
        if (!page.more || applied <= after) {
          break
        }

        after = applied
      }
    } catch (cause) {
      if (axios.isAxiosError(cause) && cause.response?.status === 429) {
        threadPauseUntil = Date.now() + 15000
      }
    } finally {
      threadBusy = false
    }
  }

  function followFeed(): void {
    stopFeed()
    if (!remote.value) {
      return
    }

    feedTimer = window.setInterval(() => {
      void pullFeed()
    }, 2000)
    document.addEventListener('visibilitychange', onFeedVisible)
    void pullFeed()
  }

  function stopFeed(): void {
    window.clearInterval(feedTimer)
    feedTimer = 0
    document.removeEventListener('visibilitychange', onFeedVisible)
  }

  function onFeedVisible(): void {
    if (!document.hidden) {
      void pullFeed()
    }
  }

  async function pullFeed(): Promise<void> {
    if (feedBusy || !remote.value || document.hidden || Date.now() < feedPauseUntil) {
      return
    }

    feedBusy = true
    try {
      let after = debateFeedCursor(items.value)
      for (let round = 0; round < 3; round += 1) {
        const page = await fetchNewerDebates(after)
        insertLivePosts(page.items)
        if (!page.more || page.latest <= after) {
          break
        }

        after = page.latest
      }

      let commentAfter = commentsCursor(items.value)
      for (let round = 0; round < 4; round += 1) {
        const page = await fetchLiveArguments(commentAfter)
        const applied = applyFeedArguments(items.value, page.items)
        if (!page.more || applied <= commentAfter) {
          break
        }

        commentAfter = applied
      }
    } catch (cause) {
      if (axios.isAxiosError(cause) && cause.response?.status === 429) {
        feedPauseUntil = Date.now() + 15000
      }
    } finally {
      feedBusy = false
    }
  }

  function insertLivePosts(posts: DebatePost[]): void {
    for (const post of posts) {
      if (items.value.some((item) => item.id === post.id)) {
        continue
      }

      if (post.featured) {
        items.value.unshift(post)
        continue
      }

      const featuredEnd = items.value.findIndex((item) => !item.featured)
      items.value.splice(featuredEnd === -1 ? items.value.length : featuredEnd, 0, post)
    }
  }

  function findComment(postId: string, commentId: string): DebateComment | undefined {
    const post = items.value.find((item) => item.id === postId)
    if (!post) {
      return undefined
    }

    for (const comment of post.comments) {
      if (comment.id === commentId) {
        return comment
      }

      const reply = comment.replies.find((item) => item.id === commentId)
      if (reply) {
        return reply
      }
    }

    return undefined
  }

  return {
    items,
    visible,
    query,
    people,
    following,
    loading,
    loadError,
    opened,
    detailLoading,
    detailError,
    load,
    open,
    toggleLike,
    share,
    toggleCommentLike,
    castVote,
    addComment,
    addReply,
    addPost,
    toggleFollow,
    followThread,
    stopThread,
    followFeed,
    stopFeed,
  }
})

function applyLocalVote(comment: DebateComment, stance: 'favor' | 'contra'): void {
  if (comment.stance === stance) {
    if (stance === 'favor' && comment.favor > 0) {
      comment.favor -= 1
    }
    if (stance === 'contra' && comment.contra > 0) {
      comment.contra -= 1
    }
    comment.stance = null
    return
  }

  if (comment.stance === 'favor' && comment.favor > 0) {
    comment.favor -= 1
  }
  if (comment.stance === 'contra' && comment.contra > 0) {
    comment.contra -= 1
  }

  comment.stance = stance
  if (stance === 'favor') {
    comment.favor += 1
    return
  }

  comment.contra += 1
}

function hasSession(): boolean {
  return localStorage.getItem('auth_token') !== null
}

function failureMessage(cause: unknown): string {
  if (!axios.isAxiosError(cause) || !cause.response) {
    return 'No se pudo conectar con el servidor.'
  }

  return firstApiMessage(readApiErrors(cause))
}

function avatarFallback(): string {
  return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=70'
}
