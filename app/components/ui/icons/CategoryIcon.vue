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
    :stroke-width="props.strokeWidth || 1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
</template>
