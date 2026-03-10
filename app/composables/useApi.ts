import { useAuthStore } from '~/stores/auth'

export const useApi = () => {
    const authStore = useAuthStore()
    
    /**
     * Tự động xử lý Refresh Token khi gặp lỗi 401
     */
    const fetchWithRefresh = async <T>(url: string, opts?: any): Promise<T> => {
        // Prepare headers with cookies for SSR
        const headers = {
            ...(useRequestHeaders(['cookie']) as Record<string, string>),
            ...opts?.headers
        }

        try {
            return await $fetch<T>(url, { ...opts, headers })
        } catch (err: any) {
            // Nếu lỗi 401 (Unauthorized) và không phải là route login/refresh
            const isAuthRoute = url.includes('/api/auth/login') || url.includes('/api/auth/refresh')
            
            if (err.response?.status === 401 && !isAuthRoute) {
                try {
                    // Bước 1: Thử gọi API Refresh Token
                    await $fetch('/api/auth/refresh', { 
                        method: 'POST',
                        headers: useRequestHeaders(['cookie']) as Record<string, string>
                    })

                    // Bước 2: Nếu refresh thành công, thực hiện lại request ban đầu
                    // Cập nhật lại cookie mới vào headers cho lần thử lại
                    const retryHeaders = {
                        ...(useRequestHeaders(['cookie']) as Record<string, string>),
                        ...opts?.headers
                    }
                    return await $fetch<T>(url, { ...opts, headers: retryHeaders })
                } catch (refreshErr) {
                    // Nếu refresh cũng thất bại -> Logout người dùng
                    authStore.clearUser()
                    
                    // Chỉ chuyển hướng nếu đang ở client-side
                    if (process.client) {
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
