<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import SoftwareModal from '~/components/modals/SoftwareModal.vue'
import LicenseModal from '~/components/modals/LicenseModal.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const id = route.params.id as string

const software = ref<any>(null)
const loading = ref(true)

const isEditModalOpen = ref(false)
const isLicenseModalOpen = ref(false)
const selectedLicense = ref<any>(null)

async function fetchSoftware() {
  loading.value = true
  try {
    const data = await api<{ success: boolean; software: any }>(`/api/software/${id}`)
    software.value = data.software
  } catch (err) {
    console.error('Fetch software error:', err)
  } finally {
    loading.value = false
  }
}

function openAddLicenseModal() {
  selectedLicense.value = null
  isLicenseModalOpen.value = true
}

function openEditLicenseModal(l: any) {
  selectedLicense.value = l
  isLicenseModalOpen.value = true
}

async function deleteLicense(licenseId: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa license này?')) return
  try {
    await api(`/api/licenses/${licenseId}`, { method: 'DELETE' })
    fetchSoftware()
  } catch (err) {
    console.error('Delete license error:', err)
  }
}

const getStatusLabel = (status: string) => {
  const options: Record<string, string> = {
    ACTIVE: 'Đang dùng', EXPIRED: 'Hết hạn', REVOKED: 'Bị thu hồi', UNUSED: 'Chưa dùng'
  }
  return options[status] || status
}

const formatDate = (date: string | null) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}

onMounted(() => {
  fetchSoftware()
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
            <NuxtLink to="/software">Phần mềm</NuxtLink>
            <span class="separator">/</span>
            <span>Chi tiết</span>
          </div>
          <h1 class="domain-title" v-if="software">{{ software.name }}</h1>
          <div class="skeleton h-8 w-64" v-else></div>
        </div>
      </div>

      <div class="header-actions" v-if="software">
        <AppButton label="Sửa Phần mềm" variant="secondary" @click="isEditModalOpen = true" />
        <AppButton label="Thêm License" variant="primary" @click="openAddLicenseModal" />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner-simple"></div>
      <p>Đang tải thông tin phần mềm...</p>
    </div>

    <div v-else-if="software" class="detail-grid">
      <!-- Info Section -->
      <div class="main-column">
        <div class="info-card stats-card">
          <div class="stat-item">
            <span class="stat-label">Nhà cung cấp</span>
            <span class="stat-value">{{ software.vendor || 'Chưa xác định' }}</span>
          </div>
          <div class="stat-item border-l border-r border-white/5">
            <span class="stat-label">Phiên bản</span>
            <span class="stat-value text-accent">{{ software.version || '—' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Số License</span>
            <span class="stat-value">{{ software.licenses?.length || 0 }}</span>
          </div>
        </div>

        <div class="info-card">
          <h2 class="card-title">Thông tin chung</h2>
          <div class="details-grid">
            <div class="detail-item">
              <label>ID Hệ thống</label>
              <span>{{ software.id }}</span>
            </div>
            <div class="detail-item">
              <label>Danh mục</label>
              <span>{{ software.category || '—' }}</span>
            </div>
            <div class="detail-item full-width">
              <label>Website</label>
              <a v-if="software.website" :href="software.website" target="_blank" class="text-accent hover:underline">
                {{ software.website }}
              </a>
              <span v-else>—</span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-white/5">
            <label class="block text-xs text-muted mb-2">Ghi chú</label>
            <p class="text-sm italic text-secondary">{{ software.notes || 'Không có ghi chú.' }}</p>
          </div>
        </div>

        <!-- License List -->
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-accent">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Danh sách Giấy phép (Licenses)
        </h2>
        
        <div v-if="software.licenses?.length === 0" class="empty-list-card">
          Chưa có license nào được đăng ký cho phần mềm này.
        </div>
        
        <div v-else class="licenses-stack">
          <div v-for="l in software.licenses" :key="l.id" class="license-row-card glass-card">
            <div class="license-info">
              <div class="flex items-center gap-3">
                <span class="font-mono text-sm font-bold text-primary">{{ l.licenseKey || 'NO-KEY' }}</span>
                <span :class="['status-badge status-sm', `status-${l.status.toLowerCase()}`]">
                  {{ getStatusLabel(l.status) }}
                </span>
              </div>
              <div class="flex gap-4 mt-2 text-xs text-muted">
                <span>Loại: {{ l.type }}</span>
                <span>Seats: {{ l.seats }}</span>
                <span>Gán cho: {{ l.assignedTo || '—' }}</span>
                <span>Hết hạn: <span :class="l.status === 'ACTIVE' ? 'text-success' : 'text-error'">{{ formatDate(l.expiresAt) }}</span></span>
              </div>
            </div>
            <div class="license-actions">
              <button class="icon-btn" @click="openEditLicenseModal(l)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="icon-btn text-error hover:bg-error/10" @click="deleteLicense(l.id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Column -->
      <div class="side-column">
        <div class="info-card">
          <h2 class="card-title">Hoạt động</h2>
          <div class="text-sm text-muted italic py-4">
            Tính năng đang phát triển...
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <SoftwareModal v-if="software" v-model="isEditModalOpen" :software="software" @save="fetchSoftware" />
    <LicenseModal 
      v-model="isLicenseModalOpen" 
      :softwareId="software?.id" 
      :license="selectedLicense" 
      @save="fetchSoftware" 
    />
  </div>
</template>

<style scoped>
.page-container { max-width: 1200px; }

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-2xl);
}

.back-btn {
  width: 40px; height: 40px;
  border-radius: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all var(--transition-fast);
}

.back-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
  border-color: var(--color-text-muted);
}

.breadcrumb {
  display: flex; align-items: center; gap: var(--spacing-xs);
  font-size: var(--font-size-xs); color: var(--color-text-muted);
  margin-bottom: 4px;
}

.breadcrumb a { text-decoration: none; color: inherit; }
.breadcrumb a:hover { color: var(--color-accent); }

.domain-title { font-size: var(--font-size-3xl); font-weight: 800; }

.header-actions { display: flex; gap: var(--spacing-md); }

.detail-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: var(--spacing-xl);
}

@media (max-width: 1024px) {
  .detail-grid { grid-template-columns: 1fr; }
}

.info-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: var(--font-size-base); font-weight: 700;
  margin-bottom: var(--spacing-lg); color: var(--color-text-primary);
  position: relative; display: inline-block;
}

.card-title::after {
  content: ''; position: absolute; bottom: -4px; left: 0;
  width: 20px; height: 2px; background: var(--color-accent); border-radius: 2px;
}

.stats-card { display: flex; padding: 0; overflow: hidden; }

.stat-item {
  flex: 1; padding: var(--spacing-lg);
  display: flex; flex-direction: column; gap: 4px;
}

.stat-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--color-text-muted);
}

.stat-value {
  font-size: var(--font-size-base); font-weight: 600;
  color: var(--color-text-primary);
}

.text-accent { color: var(--color-accent); }

.details-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg);
}

.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-item label { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.detail-item span { font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text-primary); }

.full-width { grid-column: span 2; }

/* License List */
.empty-list-card {
  padding: 40px;
  text-align: center;
  background: var(--color-bg-secondary);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-xl);
  color: var(--color-text-muted);
  font-style: italic;
}

.licenses-stack {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.license-row-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
}

.license-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--color-border);
  background: transparent; color: var(--color-text-muted);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all var(--transition-fast);
}

.icon-btn svg { width: 16px; height: 16px; }
.icon-btn:hover { background: var(--color-bg-secondary); color: var(--color-text-primary); }

/* Status Badges */
.status-badge {
  padding: 4px 10px; border-radius: var(--radius-full);
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  white-space: nowrap;
}
.status-sm { padding: 2px 8px; font-size: 9px; }

.status-active { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
.status-expired { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }
.status-revoked { background: rgba(107, 114, 128, 0.1); color: #9ca3af; }
.status-unused { background: rgba(147, 51, 234, 0.1); color: #c084fc; }

.text-success { color: #22c55e; }
.text-error { color: #ef4444; }

/* States */
.loading-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 100px; gap: var(--spacing-md); color: var(--color-text-muted);
}

.spinner-simple {
  width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.1);
  border-top-color: var(--color-accent); border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
