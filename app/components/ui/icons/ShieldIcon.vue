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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
</template>
