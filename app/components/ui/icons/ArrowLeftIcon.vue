<script setup>
const props = defineProps({
  size: [Number, String],
  strokeWidth: Number,
})
</script>

<template>
  <svg
    :width="props.size || 24"
    :height="props.size || 24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="props.strokeWidth || 2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
</template>
