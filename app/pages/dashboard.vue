<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const api = useApi()

const stats = ref({
  totalDevices: 0,
  totalCategories: 0,
  inUseDevices: 0,
  maintenanceDevices: 0
})
const recentActivities = ref<any[]>([])
const loading = ref(true)

async function fetchStats() {
  loading.value = true
  try {
    const data = await api<{ success: boolean; stats: any; recentActivities: any[] }>('/api/dashboard/stats')
    if (data.success) {
      stats.value = data.stats
      recentActivities.value = data.recentActivities
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Tổng quan hệ thống quản lý thiết bị</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon--devices">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
            stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value" v-if="!loading">{{ stats.totalDevices }}</span>
          <span class="stat-value skeleton w-12 h-8 rounded" v-else></span>
          <span class="stat-label">Thiết bị</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--categories">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value" v-if="!loading">{{ stats.totalCategories }}</span>
          <span class="stat-value skeleton w-12 h-8 rounded" v-else></span>
          <span class="stat-label">Danh mục</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--assigned">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value" v-if="!loading">{{ stats.inUseDevices }}</span>
          <span class="stat-value skeleton w-12 h-8 rounded" v-else></span>
          <span class="stat-label">Đang mượn</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--maintenance">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
            stroke-linejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value" v-if="!loading">{{ stats.maintenanceDevices }}</span>
          <span class="stat-value skeleton w-12 h-8 rounded" v-else></span>
          <span class="stat-label">Bảo trì</span>
        </div>
      </div>
    </div>

    <!-- Recent Activity Section -->
    <div class="recent-activity-section">
      <h2 class="section-title">Hoạt động cấp phát gần đây</h2>
      <div v-if="loading" class="flex flex-col gap-4 mt-4">
        <div class="skeleton h-16 w-full rounded-xl" v-for="i in 3" :key="i"></div>
      </div>
      <div v-else-if="recentActivities.length === 0" class="empty-state mt-4">
        <p class="text-muted">Chưa có dữ liệu hoạt động.</p>
      </div>
      <div v-else class="activity-list mt-4">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-card">
          <div class="activity-icon" :class="{ 'returned': activity.returnedAt }">
            <svg v-if="!activity.returnedAt" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <polyline points="16 11 18 13 22 9" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div class="activity-details">
            <div class="flex justify-between items-start mb-1">
              <span class="font-bold text-sm">
                {{ activity.returnedAt ? 'Thu hồi' : 'Cấp phát' }} thiết bị
                <NuxtLink :to="`/devices/${activity.device.id}`"
                  class="text-accent underline hover:text-primary transition-colors">
                  {{ activity.device.name }}
                </NuxtLink>
              </span>
              <span class="text-xs text-muted">&nbsp;{{ formatDate(activity.assignedAt) }}</span>
            </div>
            <p class="text-sm text-secondary">
              Người mượn: <span class="font-semibold text-primary">{{ activity.user.name || activity.user.email
                }}</span>
              <span v-if="activity.returnedAt"> &bull; Đã trả ngày {{ formatDate(activity.returnedAt) }}</span>
            </p>
          </div>
        </div>
        <div class="text-center mt-6">
          <NuxtLink to="/assignments" class="view-all-link">Xem tất cả lịch sử mượn trả</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
}

.page-header {
  margin-bottom: var(--spacing-2xl);
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

/* ===== Stats Grid ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  transition: all var(--transition-base);
}

.stat-card:hover {
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-icon--devices {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.stat-icon--categories {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
}

.stat-icon--assigned {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}

.stat-icon--maintenance {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* ===== Recent Activity ===== */
.recent-activity-section {
  margin-top: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.activity-card {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  transition: all var(--transition-fast);
}

.activity-card:hover {
  background: var(--color-surface);
  border-color: rgba(255, 255, 255, 0.08);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.returned {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}

.activity-icon svg {
  width: 20px;
  height: 20px;
}

.activity-details {
  flex: 1;
}

.view-all-link {
  display: inline-block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-accent);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  background: rgba(99, 102, 241, 0.05);
  transition: all var(--transition-fast);
}

.view-all-link:hover {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px dashed var(--color-border);
}
</style>
