import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore()
    
    // Nếu chưa có user, thử fetch
    if (!authStore.user) {
        await authStore.fetchUser()
    }

    // Nếu sau khi fetch vẫn không có user, redirect về login
    if (!authStore.user) {
        return navigateTo('/login')
    }
})
