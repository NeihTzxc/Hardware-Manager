<script setup>
const props = defineProps({
    size: [Number, String],
    strokeWidth: Number
})
</script>

<template>
    <svg
        :width="size || 24"
        :height="size || 24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        :stroke-width="strokeWidth || 1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
</template>
