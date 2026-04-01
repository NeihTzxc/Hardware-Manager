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
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
</template>
