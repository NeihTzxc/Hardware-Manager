export const useApi = () => {
    // Get store inside to avoid circular dependencies during initialization
    const getAuthStore = () => useAuthStore()

    // Lấy cookie header đồng bộ (synchronously) tại thời điểm composable được gọi
    // để tránh bị mất context của Nuxt trong các hàm async (ví dụ lúc SSR đang chạy)
    const cookieHeaders = import.meta.server ? useRequestHeaders(['cookie']) : {}

    /**
     * Tự động xử lý Refresh Token khi gặp lỗi 401 (chỉ ở client-side)
     * Trên SSR, /api/auth/me đã tự xử lý refresh nội bộ rồi
     */
    const fetchWithRefresh = async <T>(url: string, opts?: any): Promise<T> => {
        const headers = {
            ...(cookieHeaders as Record<string, string>),
            ...opts?.headers,
        }

        try {
            return await $fetch(url, { ...opts, headers }) as T
        } catch (err: any) {
            const isAuthRoute = url.includes('/api/auth/')

            if (err.response?.status === 401 && !isAuthRoute && import.meta.client) {
                try {
                    await $fetch('/api/auth/refresh', { method: 'POST' })
                    return await $fetch(url, { ...opts, headers }) as T
                } catch (refreshErr) {
                    const authStore = getAuthStore()
                    authStore.clearUser()
                    await navigateTo('/login')
                    throw refreshErr
                }
            }
            throw err
        }
    }

    return fetchWithRefresh
}
