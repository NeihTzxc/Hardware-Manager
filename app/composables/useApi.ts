export const useApi = () => {
    // Get store inside to avoid circular dependencies during initialization
    const getAuthStore = () => useAuthStore()
    
    // Lấy cookie header đồng bộ (synchronously) tại thời điểm composable được gọi 
    // để tránh bị mất context của Nuxt trong các hàm async (ví dụ lúc SSR đang chạy)
    const cookieHeaders = import.meta.server ? useRequestHeaders(['cookie']) : {}
    
    /**
     * Tự động xử lý Refresh Token khi gặp lỗi 401
     */
    const fetchWithRefresh = async <T>(url: string, opts?: any): Promise<T> => {
        // Prepare headers with cookies for SSR
        const headers = {
            ...(cookieHeaders as Record<string, string>),
            ...opts?.headers
        }

        try {
            return await $fetch(url, { ...opts, headers }) as T
        } catch (err: any) {
            // Nếu lỗi 401 (Unauthorized) và không phải là route login/refresh
            const isAuthRoute = url.includes('/api/auth/login') || url.includes('/api/auth/refresh')
            
            if (err.response?.status === 401 && !isAuthRoute) {
                try {
                    // Bước 1: Thử gọi API Refresh Token
                    await $fetch('/api/auth/refresh', { 
                        method: 'POST',
                        headers: cookieHeaders as Record<string, string>
                    })

                    // Bước 2: Nếu refresh thành công, thực hiện lại request ban đầu
                    const retryHeaders = {
                        ...(cookieHeaders as Record<string, string>),
                        ...opts?.headers
                    }
                    return await $fetch(url, { ...opts, headers: retryHeaders }) as T
                } catch (refreshErr) {
                    // Đưa useAuthStore vào đây để tránh circular dependency lúc module loading
                    const authStore = getAuthStore()
                    authStore.clearUser()
                    
                    // Chỉ chuyển hướng nếu đang ở client-side
                    if (import.meta.client) {
                        await navigateTo('/login')
                    }
                    throw refreshErr
                }
            }
            throw err
        }
    }

    return fetchWithRefresh
}
