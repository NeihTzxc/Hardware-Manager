import { defineStore } from 'pinia'

interface User {
    id: string
    email: string
    name: string | null
    role: 'ADMIN' | 'USER'
    createdAt: string
    updatedAt: string
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const loading = ref(false)

    const isLoggedIn = computed(() => !!user.value)
    const displayName = computed(() => user.value?.name || user.value?.email || '')
    const initials = computed(() => {
        if (user.value?.name) {
            return user.value.name
                .split(' ')
                .map(w => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
        }
        return user.value?.email?.charAt(0).toUpperCase() || '?'
    })

    async function fetchUser() {
        const api = useApi()
        loading.value = true
        try {
            const data = await api<{ success: boolean; user: User }>('/api/auth/me')
            user.value = data.user
        } catch {
            user.value = null
        } finally {
            loading.value = false
        }
    }


    function clearUser() {
        user.value = null
    }

    return {
        user,
        loading,
        isLoggedIn,
        displayName,
        initials,
        fetchUser,
        clearUser,
    }
})
