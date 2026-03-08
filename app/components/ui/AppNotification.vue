<script setup lang="ts">
import { useNotification } from '~/composables/useNotification'

const { notifications, remove } = useNotification()
</script>

<template>
    <div class="notification-container">
        <TransitionGroup name="notification-list" tag="div" class="notification-list">
            <div v-for="notification in notifications" :key="notification.id" class="notification-toast"
                :class="`toast-${notification.type}`">
                <div class="toast-icon">
                    <!-- Success Icon -->
                    <svg v-if="notification.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <path d="M22 4L12 14.01l-3-3" />
                    </svg>
                    <!-- Error Icon -->
                    <svg v-else-if="notification.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <!-- Info Icon -->
                    <svg v-else-if="notification.type === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <!-- Warning Icon -->
                    <svg v-else-if="notification.type === 'warning'" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>

                <div class="toast-content">
                    <h4 class="toast-title">{{ notification.title }}</h4>
                    <p v-if="notification.message" class="toast-message">{{ notification.message }}</p>
                </div>

                <button class="toast-close" @click="remove(notification.id)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" />
                    </svg>
                </button>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.notification-container {
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 9999;
    pointer-events: none;
}

.notification-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-end;
}

.notification-toast {
    pointer-events: auto;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    width: 380px;
    max-width: calc(100vw - 48px);
    padding: 16px;
    border-radius: var(--radius-lg);
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    box-shadow: var(--shadow-lg);
    position: relative;
    overflow: hidden;
}

/* Before pseudo-element for colored left border */
.notification-toast::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
}

.toast-success::before {
    background: var(--color-success);
}

.toast-error::before {
    background: var(--color-error);
}

.toast-info::before {
    background: var(--color-accent);
}

.toast-warning::before {
    background: var(--color-warning);
}

.toast-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
}

.toast-success .toast-icon {
    color: var(--color-success);
}

.toast-error .toast-icon {
    color: var(--color-error);
}

.toast-info .toast-icon {
    color: var(--color-accent);
}

.toast-warning .toast-icon {
    color: var(--color-warning);
}

.toast-icon svg {
    width: 100%;
    height: 100%;
}

.toast-content {
    flex: 1;
    min-width: 0;
}

.toast-title {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 2px;
}

.toast-message {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    line-height: 1.5;
}

.toast-close {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
}

.toast-close:hover {
    background: var(--color-surface-hover);
    color: var(--color-text-primary);
}

.toast-close svg {
    width: 16px;
    height: 16px;
}

/* Animations using Vue TransitionGroup */
.notification-list-enter-active,
.notification-list-leave-active {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.notification-list-enter-from {
    opacity: 0;
    transform: translateX(40px) scale(0.95);
}

.notification-list-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

.notification-list-leave-active {
    position: absolute;
}
</style>
