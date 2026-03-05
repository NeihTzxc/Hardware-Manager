<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    isDestructive?: boolean
}>()

const emit = defineEmits<{
    (e: 'confirm'): void
    (e: 'cancel'): void
}>()

const loading = ref(false)

function handleConfirm() {
    emit('confirm')
    // loading could be managed externally, but we emit right away
}
</script>

<template>
    <div class="modal-overlay fade-in" @click.self="emit('cancel')">
        <div class="confirm-dialog scale-in">
            <div class="dialog-header" :class="{ 'destructive': isDestructive }">
                <div class="icon-circle">
                    <svg v-if="isDestructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>
                <h3 class="dialog-title">{{ title }}</h3>
            </div>

            <div class="dialog-body">
                <p class="dialog-message">{{ message }}</p>
            </div>

            <div class="dialog-footer">
                <button class="btn-cancel" @click="emit('cancel')">
                    {{ cancelText || 'Hủy' }}
                </button>
                <button class="btn-confirm" :class="{ 'btn-danger': isDestructive, 'btn-primary': !isDestructive }"
                    @click="handleConfirm" :disabled="loading">
                    {{ confirmText || 'Xác nhận' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md);
}

.confirm-dialog {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 420px;
    box-shadow: var(--shadow-xl);
    overflow: hidden;
    padding: var(--spacing-lg);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.scale-in {
    animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.dialog-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.icon-circle {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.1);
    color: #60a5fa;
}

.dialog-header.destructive .icon-circle {
    background: rgba(239, 68, 68, 0.1);
    color: var(--color-error);
}

.icon-circle svg {
    width: 20px;
    height: 20px;
}

.dialog-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
}

.dialog-body {
    padding-left: 48px;
    /* align with text, bypassing icon */
}

.dialog-message {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.5;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-sm);
}

.btn-cancel,
.btn-confirm {
    padding: 8px 16px;
    border-radius: var(--radius-md);
    font-weight: 500;
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.btn-cancel {
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text-primary);
}

.btn-cancel:hover {
    background: var(--color-surface-hover);
}

.btn-confirm {
    border: none;
    color: white;
}

.btn-primary {
    background: var(--color-accent);
}

.btn-primary:hover {
    background: var(--color-accent-hover);
}

.btn-danger {
    background: var(--color-error);
}

.btn-danger:hover {
    background: #dc2626;
}

.btn-confirm:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}
</style>
