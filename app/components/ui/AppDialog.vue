<script setup lang="ts">
import AppButton from './AppButton.vue'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlay?: boolean
  showCloseButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  size: 'md',
  closeOnOverlay: true,
  showCloseButton: true
})

const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close()
  }
}

// Prevent scrolling when dialog is open
watch(() => props.modelValue, (val) => {
  if (process.client) {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'dialog-sm'
    case 'lg': return 'dialog-lg'
    case 'xl': return 'dialog-xl'
    case 'full': return 'dialog-full'
    default: return 'dialog-md'
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="dialog-overlay" @click.self="handleOverlayClick">
        <Transition name="dialog-scale" appear>
          <div :class="['dialog-content', sizeClasses]">
            <!-- Header -->
            <div class="dialog-header">
              <slot name="header">
                <h3 class="dialog-title">{{ title }}</h3>
              </slot>
              <button v-if="showCloseButton" class="dialog-close-btn" @click="close">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Body -->
            <div class="dialog-body">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="dialog-footer">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  padding: var(--spacing-md);
}

.dialog-content {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  width: 100%;
  position: relative;
  overflow: hidden;
}

/* Sizes */
.dialog-sm {
  max-width: 400px;
}

.dialog-md {
  max-width: 560px;
}

.dialog-lg {
  max-width: 800px;
}

.dialog-xl {
  max-width: 1100px;
}

.dialog-full {
  max-width: 95vw;
  height: 95vh;
}

.dialog-header {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.dialog-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.dialog-close-btn {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.dialog-close-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.dialog-body {
  padding: var(--spacing-xl);
  overflow-y: auto;
  flex: 1;
}

.dialog-footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  background: rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dialog-scale-enter-active,
.dialog-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dialog-scale-enter-from,
.dialog-scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>
