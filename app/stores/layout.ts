import { defineStore } from 'pinia'
import { ref, watch, onMounted } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
    const isSidebarCollapsed = ref(false)

    onMounted(() => {
        if (import.meta.client) {
            const stored = localStorage.getItem('sidebar-collapsed')
            if (stored !== null) {
                isSidebarCollapsed.value = stored === 'true'
            }
        }
    })

    watch(isSidebarCollapsed, (newVal) => {
        if (import.meta.client) {
            localStorage.setItem('sidebar-collapsed', String(newVal))
        }
    })

    function toggleSidebar() {
        isSidebarCollapsed.value = !isSidebarCollapsed.value
    }

    return {
        isSidebarCollapsed,
        toggleSidebar
    }
})
