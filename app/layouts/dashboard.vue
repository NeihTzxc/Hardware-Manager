<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// Fetch user info when entering the dashboard
await authStore.fetchUser()

async function handleLogout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
  } catch {
    // ignore
  }
  authStore.clearUser()
  await navigateTo('/login')
}
</script>

<template>
  <div class="dashboard-layout">
    <AppNotification />
    <AppSidebar @logout="handleLogout" />
    <main class="dashboard-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg-primary);
}

.dashboard-main {
  flex: 1;
  margin-left: 260px;
  padding: var(--spacing-xl) var(--spacing-2xl);
  transition: margin-left var(--transition-base);
  min-height: 100vh;
}

@media (max-width: 768px) {
  .dashboard-main {
    margin-left: 0;
    padding: calc(var(--spacing-xl) + 48px) var(--spacing-lg) var(--spacing-xl);
  }
}
</style>
