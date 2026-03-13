import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    if (!body?.email || !body?.password) {
        throw createError({
            statusCode: 400,
            message: 'Email và mật khẩu là bắt buộc.',
        })
    }

    // Find user by email
    const user = await db.user.findUnique({
        where: { email: body.email },
    })

    if (!user) {
        console.log('User not found')
        throw createError({
            statusCode: 401,
            message: 'Email hoặc mật khẩu không chính xác.',
        })
    }

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(body.password, user.password)

    if (!isPasswordValid) {
        console.log('Password is not valid')
        throw createError({
            statusCode: 401,
            message: 'Email hoặc mật khẩu không chính xác.',
        })
    }

    // Generate tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // Store refresh token in database
    await prismaBase.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: getRefreshTokenExpiry(),
        },
    })

    // Set httpOnly cookies
    setCookie(event, 'access_token', accessToken, ACCESS_COOKIE_OPTIONS)
    setCookie(event, 'refresh_token', refreshToken, REFRESH_COOKIE_OPTIONS)

    // Return user info (without password)
    const { password: _, ...userWithoutPassword } = user

    return {
        success: true,
        user: userWithoutPassword,
    }
})
