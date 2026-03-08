<script setup lang="ts">
interface Tab {
  id: string
  label: string
  icon?: string
}

const props = defineProps<{
  tabs: Tab[]
  modelValue: string 
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="tabs-container">
    <div class="tabs-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: modelValue === tab.id }"
        @click="emit('update:modelValue', tab.id)"
      >
        <span v-if="tab.icon" class="tab-icon" v-html="tab.icon"></span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
    <div class="tab-content-area">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.tabs-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.tabs-nav {
  display: flex;
  gap: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-xl);
  overflow-x: auto;
  padding-bottom: 1px; /* prevent bottom border overlap clipping */
}

/* Hide scrollbar but keep functionality */
.tabs-nav::-webkit-scrollbar {
  display: none;
}
.tabs-nav {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  margin-bottom: -1px; /* overlap exact bottom border line */
}

.tab-btn:hover {
  color: var(--color-text-primary);
}

.tab-btn.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.tab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}
.tab-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.tab-content-area {
  animation: fadeIn 0.3s ease;
}
</style>
