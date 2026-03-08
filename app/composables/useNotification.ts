import { ref } from 'vue'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
    id: string
    title: string
    message?: string
    type: NotificationType
    duration?: number
}

// Global state for notifications
const notifications = ref<Notification[]>([])

export function useNotification() {
    function add(notification: Omit<Notification, 'id'>) {
        const id = Math.random().toString(36).substring(2, 9)
        const duration = notification.duration || 3000

        notifications.value.push({
            ...notification,
            id
        })

        if (duration > 0) {
            setTimeout(() => {
                remove(id)
            }, duration)
        }
    }

    function remove(id: string) {
        const index = notifications.value.findIndex(n => n.id === id)
        if (index !== -1) {
            notifications.value.splice(index, 1)
        }
    }

    function success(title: string, message?: string, duration?: number) {
        add({ title, message, type: 'success', duration })
    }

    function error(title: string, message?: string, duration?: number) {
        add({ title, message, type: 'error', duration: duration || 5000 })
    }

    function info(title: string, message?: string, duration?: number) {
        add({ title, message, type: 'info', duration })
    }

    return {
        notifications,
        add,
        remove,
        success,
        error,
        info
    }
}
