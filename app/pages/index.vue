<script setup lang="ts">
</script>

<template>
  <div class="home-container">
    <div class="home-content fade-in">
      <div class="home-icon">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="12" fill="url(#home-grad)" />
          <path d="M14 17h20v2H14v-2zm0 6h20v2H14v-2zm0 6h12v2H14v-2z" fill="white" opacity="0.9" />
          <defs>
            <linearGradient id="home-grad" x1="0" y1="0" x2="48" y2="48">
              <stop stop-color="#6366f1" />
              <stop offset="1" stop-color="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h1 class="home-title">Hardware Manager</h1>
      <p class="home-subtitle">Chào mừng bạn đến với hệ thống quản lý phần cứng.</p>
      <NuxtLink to="/login" class="home-cta">Đăng nhập</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-primary);
  padding: var(--spacing-xl);
}

.home-content {
  text-align: center;
  max-width: 480px;
}

.home-icon {
  margin-bottom: var(--spacing-lg);
}

.home-icon svg {
  width: 64px;
  height: 64px;
  margin: 0 auto;
}

.home-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: var(--spacing-sm);
  background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.home-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-2xl);
}

.home-cta {
  display: inline-block;
  padding: 14px 40px;
  background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
  color: white;
  font-weight: 600;
  font-size: var(--font-size-base);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  text-decoration: none;
}

.home-cta:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
  color: white;
}
</style>
