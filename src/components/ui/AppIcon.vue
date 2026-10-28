<script setup lang="ts">
export type IconName =
  | 'search'
  | 'bell'
  | 'message'
  | 'settings'
  | 'like'
  | 'comment'
  | 'share'
  | 'home'
  | 'users'
  | 'news'
  | 'vote'
  | 'calendar'
  | 'groups'
  | 'plus'
  | 'play'
  | 'image'
  | 'video'
  | 'poll'
  | 'filter'
  | 'send'
  | 'more'
  | 'check'
  | 'menu'
  | 'pencil'
  | 'pin'

defineProps<{
  name: IconName
}>()
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
    <template v-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'bell'">
      <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" stroke-linejoin="round" />
      <path d="M10 20a2 2 0 0 0 4 0" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'message'">
      <path d="M5 6h14v9H8l-3 3V6Z" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"
        stroke-linecap="round"
      />
    </template>
    <template v-else-if="name === 'like'">
      <path
        d="M8 11v9H5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Zm0 0 3.2-6.2A2 2 0 0 1 13 4a2 2 0 0 1 2 2v3h4.2a2 2 0 0 1 2 2.3l-.8 6A2 2 0 0 1 18.4 19H8"
        stroke-linejoin="round"
      />
    </template>
    <template v-else-if="name === 'comment'">
      <path d="M6 6h12v8H9l-3 3V6Z" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'share'">
      <path d="M7 12h8M12 7l5 5-5 5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M5 6v12" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'home'">
      <path d="m4 11 8-7 8 7v8a1 1 0 0 1-1 1h-5v-5H10v5H5a1 1 0 0 1-1-1v-8Z" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'users'">
      <circle cx="9" cy="9" r="3" />
      <path d="M4 18c.6-2.4 2.5-4 5-4s4.4 1.6 5 4" stroke-linecap="round" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M16 14.2c1.8.3 3.2 1.5 3.8 3.3" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'news'">
      <path d="M5 5h11v14H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path d="M16 8h3v10a2 2 0 0 1-2 2" stroke-linecap="round" />
      <path d="M8 9h5M8 12h5M8 15h3" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'vote'">
      <path d="M8 4h8v6H8V4Z" />
      <path d="M7 20h10M12 10v10M8 14h8" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'calendar'">
      <path d="M5 6h14v13H5V6Z" />
      <path d="M8 4v4M16 4v4M5 10h14" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'groups'">
      <path d="M4 8h7v10H4V8ZM13 8h7v6h-7V8ZM13 16h7v2h-7v-2Z" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'plus'">
      <path d="M12 6v12M6 12h12" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'play'">
      <circle cx="12" cy="12" r="9" />
      <path d="m10 9 6 3-6 3V9Z" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'image'">
      <path d="M5 5h14v14H5V5Z" />
      <circle cx="9" cy="10" r="1.4" fill="currentColor" stroke="none" />
      <path d="m7 16 3-3 2 2 2-2 3 3" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'video'">
      <rect x="3" y="7" width="13" height="10" rx="1.5" />
      <path d="m16 11 5-2v8l-5-2v-4Z" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'poll'">
      <path d="M5 19V10M12 19V5M19 19v-7" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'filter'">
      <path d="M4 6h16M7 12h10M10 18h4" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'send'">
      <path d="m4 12 16-7-6 16-2-7-8-2Z" stroke-linejoin="round" />
    </template>
    <template v-else-if="name === 'more'">
      <circle cx="6" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'menu'">
      <path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'pencil'">
      <path d="M4 20h4l10-10-4-4L4 16v4Z" stroke-linejoin="round" />
      <path d="m12 6 4 4" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'pin'">
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" stroke-linejoin="round" />
      <circle cx="12" cy="11" r="1.6" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'check'">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" stroke-linecap="round" stroke-linejoin="round" />
    </template>
  </svg>
</template>
