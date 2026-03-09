<script setup lang="ts">
interface Props {
  label?: string
  id?: string
  error?: string
  help?: string
  required?: boolean
  labelClass?: string
}

defineProps<Props>()
</script>

<template>
  <div class="form-control-wrapper">
    <!-- Label -->
    <label 
      v-if="label" 
      :for="id" 
      :class="['form-label', labelClass, { 'is-required': required }]"
    >
      {{ label }}
    </label>

    <!-- Input Slot -->
    <div class="form-input-container">
      <slot :id="id" :is-error="!!error" />
    </div>

    <!-- Feedback (Error/Help) -->
    <Transition name="slide-up">
      <p v-if="error" class="form-error">
        <i class="pi pi-exclamation-circle"></i>
        {{ error }}
      </p>
      <p v-else-if="help" class="form-help">{{ help }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.form-control-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  width: 100%;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.form-control-wrapper:focus-within .form-label {
  color: var(--color-accent-hover);
}

.is-required::after {
  content: "*";
  color: var(--color-error);
  font-weight: bold;
}

.form-input-container {
  position: relative;
}

.form-help {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}

.form-error {
  font-size: var(--font-size-xs);
  color: var(--color-error);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.form-error i {
  font-size: 0.85rem;
}

/* Transitions */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.2s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Global-ish Input Styles for use inside FormControl */
:deep(input:not([type="checkbox"]):not([type="radio"])),
:deep(select),
:deep(textarea) {
  width: 100%;
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
  outline: none;
}

:deep(input:focus),
:deep(select:focus),
:deep(textarea:focus) {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
  background: rgba(255, 255, 255, 0.02);
}

:deep(.has-error input),
:deep(.has-error select),
:deep(.has-error textarea) {
  border-color: var(--color-error);
}

:deep(.has-error input:focus) {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}
</style>
