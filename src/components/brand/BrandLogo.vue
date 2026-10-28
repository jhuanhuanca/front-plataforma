<script setup lang="ts">
interface Props {
  variant?: 'lockup' | 'mark'
  decorative?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'lockup',
  decorative: false,
})
</script>

<template>
  <img
    :src="variant === 'mark' ? '/brand/enagenda-mark.png?v=2' : '/brand/enagenda-logo.png?v=2'"
    :alt="decorative || variant === 'mark' ? '' : 'EnAgenda'"
    class="block object-contain object-left"
    :class="variant === 'mark' ? 'h-10 w-10' : 'h-10 w-auto max-w-[11rem] sm:h-12 sm:max-w-[16rem]'"
  />
</template>
