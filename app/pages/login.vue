<script setup lang="ts">
definePageMeta({ layout: false })

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

async function handleLogin() {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Vui lòng nhập đầy đủ email và mật khẩu.'
    return
  }

  isLoading.value = true

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })

    // Login thành công — cookies đã được set bởi server
    // Redirect về trang chủ
    await navigateTo('/')
  } catch (err: any) {
    errorMessage.value =
      err?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <!-- Hero Panel (left) -->
    <div class="login-hero">
      <div class="hero-content slide-in-left">
        <div class="hero-logo">
          <div class="logo-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="url(#logo-gradient)" />
              <path d="M12 14h16v2H12v-2zm0 5h16v2H12v-2zm0 5h10v2H12v-2z" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40">
                  <stop stop-color="#6366f1" />
                  <stop offset="1" stop-color="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="logo-text">Hardware Manager</span>
        </div>

        <h1 class="hero-title">
          Quản lý phần cứng<br />
          <span class="hero-highlight">thông minh & hiệu quả</span>
        </h1>
        <p class="hero-description">
          Giám sát, theo dõi và quản lý toàn bộ thiết bị phần cứng của bạn trong một nền tảng duy nhất.
        </p>

        <!-- Decorative floating shapes -->
        <div class="hero-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>
    </div>

    <!-- Login Form (right) -->
    <div class="login-form-section">
      <div class="login-form-wrapper fade-in">
        <div class="form-header">
          <!-- Mobile logo (shown on small screens) -->
          <div class="mobile-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="url(#logo-gradient-m)" />
              <path d="M12 14h16v2H12v-2zm0 5h16v2H12v-2zm0 5h10v2H12v-2z" fill="white" opacity="0.9" />
              <defs>
                <linearGradient id="logo-gradient-m" x1="0" y1="0" x2="40" y2="40">
                  <stop stop-color="#6366f1" />
                  <stop offset="1" stop-color="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 class="form-title">Đăng nhập</h2>
          <p class="form-subtitle">Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>
        </div>

        <!-- Error Alert -->
        <Transition name="slide-fade">
          <div v-if="errorMessage" class="error-alert" role="alert">
            <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        </Transition>

        <form @submit.prevent="handleLogin" class="login-form" novalidate>
          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <input
                id="email"
                v-model="email"
                type="email"
                class="form-input"
                placeholder="name@company.com"
                autocomplete="email"
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">Mật khẩu</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="••••••••"
                autocomplete="current-password"
                :disabled="isLoading"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                tabindex="-1"
                :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
              >
                <!-- Eye icon -->
                <svg v-if="!showPassword" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
                <!-- Eye-off icon -->
                <svg v-else viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember / Forgot -->
          <div class="form-extras">
            <label class="checkbox-wrapper">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">Nhớ mật khẩu</span>
            </label>
            <a href="#" class="forgot-link">Quên mật khẩu?</a>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-login"
            :disabled="isLoading"
            :class="{ loading: isLoading }"
          >
            <svg v-if="isLoading" class="spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="31.4 31.4" />
            </svg>
            <span v-else>Đăng nhập</span>
          </button>
        </form>

        <p class="form-footer">
          Chưa có tài khoản?
          <a href="#" class="signup-link">Đăng ký ngay</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== Login Container ===== */
.login-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

/* ===== Hero Panel ===== */
.login-hero {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
  position: relative;
  overflow: hidden;
}

.login-hero::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 480px;
}

.hero-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
}

.logo-icon svg {
  width: 44px;
  height: 44px;
}

.logo-text {
  font-size: var(--font-size-xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-title {
  font-size: clamp(var(--font-size-2xl), 3vw, var(--font-size-4xl));
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin-bottom: var(--spacing-lg);
}

.hero-highlight {
  background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  line-height: 1.7;
}

/* Floating decorative shapes */
.hero-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: var(--radius-2xl);
  opacity: 0.06;
}

.shape-1 {
  width: 200px;
  height: 200px;
  background: var(--color-accent);
  top: 10%;
  right: 10%;
  animation: float 6s ease-in-out infinite;
}

.shape-2 {
  width: 120px;
  height: 120px;
  background: var(--color-gradient-end);
  bottom: 20%;
  left: 5%;
  animation: float 8s ease-in-out infinite 1s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  background: var(--color-accent);
  bottom: 10%;
  right: 25%;
  animation: float 7s ease-in-out infinite 2s;
  border-radius: var(--radius-full);
}

/* ===== Login Form Section ===== */
.login-form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background-color: var(--color-bg-primary);
}

.login-form-wrapper {
  width: 100%;
  max-width: 420px;
}

.form-header {
  margin-bottom: var(--spacing-2xl);
}

.mobile-logo {
  display: none;
  margin-bottom: var(--spacing-lg);
}

.mobile-logo svg {
  width: 44px;
  height: 44px;
}

.form-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: var(--spacing-sm);
}

.form-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* ===== Error Alert ===== */
.error-alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-lg);
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--color-error);
}

/* Transition for error alert */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ===== Form Groups ===== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 12px 14px 12px 44px;
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  transition: all var(--transition-base);
  outline: none;
}

.form-input::placeholder {
  color: var(--color-text-muted);
}

.form-input:focus {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-accent-light), var(--shadow-glow);
}

.form-input:focus ~ .input-icon,
.input-wrapper:focus-within .input-icon {
  color: var(--color-accent);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Toggle password visibility */
.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
  display: flex;
  align-items: center;
}

.toggle-password svg {
  width: 18px;
  height: 18px;
}

.toggle-password:hover {
  color: var(--color-text-secondary);
}

/* ===== Extras Row ===== */
.form-extras {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  position: relative;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-input);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.checkbox-custom::after {
  content: '';
  width: 10px;
  height: 10px;
  background: var(--color-accent);
  border-radius: 2px;
  transform: scale(0);
  transition: transform var(--transition-fast);
}

.checkbox-input:checked + .checkbox-custom {
  border-color: var(--color-accent);
}

.checkbox-input:checked + .checkbox-custom::after {
  transform: scale(1);
}

.checkbox-input:focus-visible + .checkbox-custom {
  box-shadow: 0 0 0 3px var(--color-accent-light);
}

.forgot-link {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

/* ===== Login Button ===== */
.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
  color: white;
  font-weight: 600;
  font-size: var(--font-size-base);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.btn-login::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-accent-hover), #c084fc);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.btn-login:hover:not(:disabled)::before {
  opacity: 1;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login span {
  position: relative;
  z-index: 1;
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 22px;
  height: 22px;
  animation: spin 0.8s linear infinite;
  position: relative;
  z-index: 1;
}

/* ===== Form Footer ===== */
.form-footer {
  text-align: center;
  margin-top: var(--spacing-2xl);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.signup-link {
  font-weight: 600;
}

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .login-hero {
    display: none;
  }

  .login-container {
    justify-content: center;
  }

  .login-form-section {
    max-width: 100%;
  }

  .mobile-logo {
    display: block;
  }
}

@media (max-width: 480px) {
  .login-form-section {
    padding: var(--spacing-lg);
  }

  .form-title {
    font-size: var(--font-size-2xl);
  }
}
</style>
