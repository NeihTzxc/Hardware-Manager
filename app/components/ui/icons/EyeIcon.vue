<script setup>
const props = defineProps({
  size: { type: [Number, String], default: 24 },
  strokeWidth: { type: Number, default: 2 }
})
</script>

<template>
  <svg :width="props.size" :height="props.size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    :stroke-width="props.strokeWidth" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
</template>
