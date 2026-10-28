<script setup lang="ts">
import { apiFailure, clearApiFailure } from '../../lib/apiFailure'
</script>

<template>
  <p v-if="apiFailure !== null" class="bg-rose-900 px-4 py-2 text-center text-sm text-white" role="alert">
    No pudimos completar eso.
    <span v-if="apiFailure">Código {{ apiFailure }}.</span>
    <button type="button" class="ml-2 underline" @click="clearApiFailure">Cerrar</button>
  </p>
</template>
