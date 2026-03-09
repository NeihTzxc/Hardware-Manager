<script setup lang="ts">
interface Props {
  label?: string
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  icon?: string
  iconPosition?: 'leading' | 'trailing'
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  iconPosition: 'leading',
  block: false
})

const emit = defineEmits(['click'])

const handleClick = (event: MouseEvent) => {
  if (props.loading || props.disabled) return
  emit('click', event)
}

const variantClasses = computed(() => {
  const base = 'btn-base'
  switch (props.variant) {
    case 'primary': return `${base} btn-primary`
    case 'secondary': return `${base} btn-secondary`
    case 'danger': return `${base} btn-danger`
    case 'success': return `${base} btn-success`
    case 'ghost': return `${base} btn-ghost`
    default: return `${base} btn-primary`
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'btn-sm'
    case 'lg': return 'btn-lg'
    default: return 'btn-md'
  }
})
</script>

<template>
  <button
    :type="type"
    :class="[variantClasses, sizeClasses, { 'btn-loading': loading, 'btn-disabled': disabled, 'btn-block': block }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <span v-if="loading" class="btn-spinner">
      <svg class="animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>

    <!-- Leading Icon -->
    <span v-if="!loading && icon && iconPosition === 'leading'" class="btn-icon">
      <i :class="icon"></i>
    </span>

    <!-- Label / Slot -->
    <span v-if="label || $slots.default" class="btn-text">
      <slot>{{ label }}</slot>
    </span>

    <!-- Trailing Icon -->
    <span v-if="!loading && icon && iconPosition === 'trailing'" class="btn-icon">
      <i :class="icon"></i>
    </span>
  </button>
</template>

<style scoped>
.btn-base {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1px solid transparent;
  user-select: none;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.btn-base:active {
  transform: scale(0.97);
}

.btn-block {
  display: flex;
  width: 100%;
}

/* Sizes */
.btn-sm {
  padding: 6px 12px;
  font-size: var(--font-size-xs);
  border-radius: var(--radius-sm);
}

.btn-md {
  padding: 10px 20px;
  font-size: var(--font-size-sm);
}

.btn-lg {
  padding: 14px 28px;
  font-size: var(--font-size-base);
  border-radius: var(--radius-lg);
}

/* Variants */
.btn-primary {
  background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--shadow-glow);
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-surface-hover);
  border-color: var(--color-text-muted);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.btn-danger:hover:not(:disabled) {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.btn-success {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.btn-success:hover:not(:disabled) {
  background: #22c55e;
  color: white;
  border-color: #22c55e;
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

/* States */
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.btn-loading {
  cursor: wait;
}

/* Spinner */
.btn-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-spinner svg {
  width: 1.2em;
  height: 1.2em;
  animation: spin 1s linear infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.opacity-25 { opacity: 0.25; }
.opacity-75 { opacity: 0.75; }

/* Icon styles */
.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
}
</style>
