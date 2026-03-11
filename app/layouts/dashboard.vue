<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useLayoutStore } from '~/stores/layout'
import AppNotification from '~/components/ui/AppNotification.vue'
const authStore = useAuthStore()
const layoutStore = useLayoutStore()

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
    <main class="dashboard-main" :class="{ 'collapsed': layoutStore.isSidebarCollapsed }">
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

.dashboard-main.collapsed {
  margin-left: 76px;
}

@media (max-width: 768px) {
  .dashboard-main {
    margin-left: 0;
    padding: calc(var(--spacing-xl) + 48px) var(--spacing-lg) var(--spacing-xl);
  }
}
</style>
