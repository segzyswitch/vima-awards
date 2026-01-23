<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})

const handleError = () => clearError({ redirect: '/' })

console.log(props.error);
</script>

<template>
  <div class="w-100 vh-100 d-flex">
    <div class="text-light text-center m-auto">
      <i class="bi bi-wifi-off text-muted display-1 mb-4 d-inline-block"></i>

      <p class="lead mb-5">{{ error?.statusMessage }}</p>
      <a href="/" class="btn btn-success bg-teal px-4">Reload</a>
      <!-- <button @click="handleError">Retry</button> -->
    </div>
  </div>
</template>