<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchHeroes, type HeroSlot } from '../../api/heroes'

const props = defineProps<{
  place: 'home' | 'polls'
}>()

const hero = ref<HeroSlot>({ announcement: '', kind: '', media: '' })

const directVideo = computed(() => hero.value.kind === 'video' && /\.(mp4|webm)(\?|#|$)/i.test(hero.value.media))
const embedUrl = computed(() => hero.value.kind === 'video' ? videoEmbed(hero.value.media) : '')

onMounted(async () => {
  try {
    const slots = await fetchHeroes()
    hero.value = slots[props.place]
  } catch {
    hero.value = { announcement: '', kind: '', media: '' }
  }
})

function videoEmbed(url: string): string {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return ''
  }

  if (parsed.protocol !== 'https:') {
    return ''
  }

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
  if (host === 'youtu.be') {
    return youtube(parsed.pathname.split('/').filter(Boolean)[0] ?? '')
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host === 'youtube-nocookie.com') {
    const parts = parsed.pathname.split('/').filter(Boolean)
    const fromPath = parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live' ? (parts[1] ?? '') : ''
    return youtube(parsed.searchParams.get('v') || fromPath)
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = parsed.pathname.split('/').filter((part) => /^\d+$/.test(part)).pop() ?? ''
    return id === '' ? '' : `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&background=1`
  }

  return ''
}

function youtube(id: string): string {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    return ''
  }

  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&modestbranding=1`
}
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <video
      v-if="directVideo"
      :src="hero.media"
      class="h-full w-full object-cover"
      autoplay
      muted
      loop
      playsinline
    />
    <iframe
      v-else-if="embedUrl"
      :src="embedUrl"
      class="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
      title=""
      tabindex="-1"
      allow="autoplay; encrypted-media"
      referrerpolicy="strict-origin-when-cross-origin"
    />
    <img
      v-else-if="hero.kind === 'image' && hero.media"
      :src="hero.media"
      alt=""
      class="h-full w-full object-cover"
    />
    <div v-if="hero.media" class="absolute inset-0 bg-brand/60"></div>
  </div>
  <slot :announcement="hero.announcement" />
</template>
