<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const id = route.params.id as string

const assignment = ref<any>(null)
const loading = ref(true)

async function fetchAssignment() {
  loading.value = true
  try {
    const data = await api<{ success: boolean; assignment: any }>(`/api/assignments/${id}`)
    assignment.value = data.assignment
  } catch (err) {
    console.error('Fetch assignment detail error:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string | null) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('vi-VN')
}

onMounted(() => {
  fetchAssignment()
})
</script>

<template>
  <div class="page-container fade-in">
    <div class="detail-header">
      <div class="flex items-center gap-4">
        <button class="back-btn" @click="router.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div>
          <div class="breadcrumb">
            <NuxtLink to="/assignments">Mượn trả</NuxtLink>
            <span class="separator">/</span>
            <span>Chi tiết</span>
          </div>
          <h1 class="page-title-text" v-if="assignment">Chi tiết cấp phát #{{ assignment.id }}</h1>
          <div class="skeleton h-8 w-64" v-else></div>
        </div>
      </div>
      
      <div class="header-actions" v-if="assignment">
        <AppButton label="In biên bản" variant="secondary" @click="router.push(`/assignments/${assignment.id}/print`)" />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner-simple"></div>
      <p>Đang tải thông tin cấp phát...</p>
    </div>

    <div v-else-if="assignment" class="detail-grid">
      <!-- Device Info -->
      <div class="info-card">
        <h2 class="card-title">Thiết bị</h2>
        <div class="flex items-center gap-4 mb-6">
          <div class="device-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div>
            <NuxtLink :to="`/devices/${assignment.device.id}`" class="text-lg font-bold hover:text-accent transition-colors">
              {{ assignment.device.name }}
            </NuxtLink>
            <p class="text-sm text-muted">{{ assignment.device.serialNumber }} • {{ assignment.device.category?.name }}</p>
          </div>
        </div>
        <div class="details-grid-2">
          <div class="detail-item">
            <label>Model</label>
            <span>{{ assignment.device.model || '—' }}</span>
          </div>
          <div class="detail-item">
            <label>Vị trí thiết bị</label>
            <span>{{ assignment.device.location?.name || '—' }}</span>
          </div>
        </div>
      </div>

      <!-- User Info -->
      <div class="info-card">
        <h2 class="card-title">Người sử dụng</h2>
        <div class="flex items-center gap-4 mb-6">
          <div class="user-avatar">
            {{ assignment.user.name.charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="text-lg font-bold">{{ assignment.user.name }}</p>
            <p class="text-sm text-muted">{{ assignment.user.email }}</p>
          </div>
        </div>
        <div class="details-grid-2">
          <div class="detail-item">
            <label>Phòng ban</label>
            <span>—</span>
          </div>
          <div class="detail-item">
            <label>ID Người dùng</label>
            <span>{{ assignment.user.id }}</span>
          </div>
        </div>
      </div>

      <!-- Assignment Details -->
      <div class="info-card full-width">
        <h2 class="card-title">Thông tin mượn / trả</h2>
        <div class="assignment-flow">
          <div class="flow-step">
            <div class="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
            </div>
            <div class="step-content">
              <label>Ngày cấp</label>
              <span class="text-lg font-semibold">{{ formatDate(assignment.assignedAt) }}</span>
            </div>
          </div>
          
          <div class="flow-arrow" :class="{ 'returned': assignment.returnedAt }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </div>

          <div class="flow-step" :class="{ 'pending': !assignment.returnedAt }">
            <div class="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div class="step-content">
              <label>Ngày trả</label>
              <span class="text-lg font-semibold" v-if="assignment.returnedAt">{{ formatDate(assignment.returnedAt) }}</span>
              <span class="text-lg font-semibold italic text-muted" v-else>Chưa trả</span>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-white/5">
          <label class="block text-xs text-muted mb-2 uppercase tracking-wider font-bold">Ghi chú cấp phát</label>
          <p class="text-secondary italic bg-white/5 p-4 rounded-lg">{{ assignment.notes || 'Không có ghi chú nào cho đợt cấp phát này.' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container { max-width: 1000px; }
.detail-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-2xl); }
.back-btn {
  width: 40px; height: 40px; border-radius: 12px;
  background: var(--color-surface); border: 1px solid var(--color-border);
  color: var(--color-text-secondary); display: flex; align-items: center;
  justify-content: center; cursor: pointer; transition: all var(--transition-fast);
}
.back-btn:hover { background: var(--color-surface-hover); color: var(--color-text-primary); }
.breadcrumb { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-bottom: 4px; display: flex; gap: 4px; }
.page-title-text { font-size: var(--font-size-2xl); font-weight: 800; }

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-xl); }
.full-width { grid-column: span 2; }

@media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } .full-width { grid-column: span 1; } }

.info-card {
  background: var(--color-bg-card); border: 1px solid var(--color-border);
  border-radius: var(--radius-xl); padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}
.card-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); margin-bottom: var(--spacing-xl); }

.device-icon, .user-avatar {
  width: 56px; height: 56px; border-radius: 16px;
  background: var(--color-surface); color: var(--color-accent);
  display: flex; align-items: center; justify-content: center;
}
.device-icon svg { width: 28px; height: 28px; }
.user-avatar { font-size: 20px; font-weight: 800; background: linear-gradient(135deg, var(--color-accent), #818cf8); color: white; }

.details-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-item label { font-size: 11px; text-transform: uppercase; color: var(--color-text-muted); font-weight: 600; }
.detail-item span { font-size: var(--font-size-sm); font-weight: 600; }

/* Flow */
.assignment-flow { display: flex; align-items: center; justify-content: space-around; gap: var(--spacing-md); margin-top: var(--spacing-xl); }
.flow-step { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; gap: var(--spacing-md); }
.step-icon { width: 48px; height: 48px; border-radius: 50%; background: rgba(99, 102, 241, 0.1); color: var(--color-accent); display: flex; align-items: center; justify-content: center; }
.step-icon svg { width: 20px; height: 20px; }
.step-content { display: flex; flex-direction: column; gap: 2px; }
.step-content label { font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; }

.flow-arrow { width: 60px; color: var(--color-border); }
.flow-arrow.returned { color: var(--color-accent); }

.flow-step.pending .step-icon { background: var(--color-surface); color: var(--color-text-muted); }

.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px; gap: 16px; color: var(--color-text-muted); }
.spinner-simple { width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.1); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
</style>
