<script setup lang="ts">
import Tabs from '~/components/ui/Tabs.vue'
import UserList from '~/components/users/UserList.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const activeTab = ref('users')

const tabs = [
  {
    id: 'users',
    label: 'Người dùng',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>'
  },
  {
    id: 'system',
    label: 'Hệ thống',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>'
  }
]
</script>

<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Cài đặt</h1>
        <p class="page-subtitle">Cấu hình và tùy chỉnh hệ thống</p>
      </div>
    </div>

    <div class="settings-content">
      <Tabs v-model="activeTab" :tabs="tabs">
        <!-- Users Tab -->
        <div v-if="activeTab === 'users'">
          <UserList />
        </div>

        <!-- System Tab Placeholder -->
        <div v-if="activeTab === 'system'">
          <div class="empty-state">
            <h3 class="empty-state-title">Cài đặt hệ thống</h3>
            <p class="empty-state-desc">Tính năng đang được phát triển.</p>
          </div>
        </div>
      </Tabs>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-xl); /* reduced from 2xl */
}
.page-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--spacing-xs);
}
.page-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}
.settings-content {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  min-height: 500px;
}

/* Reusing empty state for unbuilt tabs */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  min-height: 200px;
  text-align: center;
}
.empty-state-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}
.empty-state-desc {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
