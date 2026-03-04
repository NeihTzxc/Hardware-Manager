export default defineEventHandler(async (event) => {
    const refreshTokenCookie = getCookie(event, 'refresh_token')

    // Delete refresh token from DB if present
    if (refreshTokenCookie) {
        await prismaBase.refreshToken.deleteMany({
            where: { token: refreshTokenCookie },
        })
    }

    // Clear cookies
    deleteCookie(event, 'access_token')
    deleteCookie(event, 'refresh_token')

    return { success: true, message: 'Đăng xuất thành công.' }
})
