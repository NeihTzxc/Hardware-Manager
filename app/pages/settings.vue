<script setup lang="ts">
import Tabs from '~/components/ui/Tabs.vue'
import UserList from '~/components/users/UserList.vue'
import AlertConfiguration from '~/components/settings/AlertConfiguration.vue'
import SystemConfiguration from '~/components/settings/SystemConfiguration.vue'
import DataReset from '~/components/settings/DataReset.vue'
import UsersIcon from '~/components/ui/icons/UsersIcon.vue'
import BellIcon from '~/components/ui/icons/BellIcon.vue'
import SettingsIcon from '~/components/ui/icons/SettingsIcon.vue'
import DatabaseIcon from '~/components/ui/icons/DatabaseIcon.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const activeTab = ref('users')

const tabs = [
  {
    id: 'users',
    label: 'Người dùng',
    icon: UsersIcon
  },
  {
    id: 'alerts',
    label: 'Cấu hình Thông báo',
    icon: BellIcon
  },
  {
    id: 'system',
    label: 'Hệ thống',
    icon: SettingsIcon
  },
  {
    id: 'data',
    label: 'Dữ liệu',
    icon: DatabaseIcon
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

        <!-- Alerts Tab -->
        <div v-if="activeTab === 'alerts'">
          <AlertConfiguration />
        </div>

        <!-- System Tab -->
        <div v-if="activeTab === 'system'">
          <SystemConfiguration />
        </div>

        <!-- Data Tab -->
        <div v-if="activeTab === 'data'">
          <DataReset />
        </div>
      </Tabs>
    </div>
  </div>
</template>

<style scoped>

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
