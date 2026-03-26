<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import SoftwareModal from '~/components/modals/SoftwareModal.vue'
import LicenseModal from '~/components/modals/LicenseModal.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const router = useRouter()
const api = useApi()
const activeTab = ref<'software' | 'licenses'>('software')
const loading = ref(true)
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')

// Software data
const softwareList = ref<any[]>([])
const isSoftwareModalOpen = ref(false)
const selectedSoftware = ref<any>(null)

// License data
const licenses = ref<any[]>([])
const isLicenseModalOpen = ref(false)
const selectedLicense = ref<any>(null)

async function fetchData() {
  loading.value = true
  try {
    if (activeTab.value === 'software') {
      const data = await api<{ success: boolean; software: any[] }>('/api/software', {
        params: { 
          q: searchQuery.value,
          category: categoryFilter.value
        }
      })
      softwareList.value = data.software
    } else {
      const data = await api<{ success: boolean; licenses: any[] }>('/api/licenses', {
        params: {
          q: searchQuery.value,
          status: statusFilter.value
        }
      })
      licenses.value = data.licenses
    }
  } catch (err) {
    console.error('Fetch data error:', err)
  } finally {
    loading.value = false
  }
}

function goToDetail(id: string) {
  if (activeTab.value === 'software') {
    router.push(`/software/${id}`)
  } else {
    const license = licenses.value.find(l => l.id === id)
    if (license?.softwareId) {
      router.push(`/software/${license.softwareId}`)
    }
  }
}

function openAddModal() {
  if (activeTab.value === 'software') {
    selectedSoftware.value = null
    isSoftwareModalOpen.value = true
  } else {
    selectedLicense.value = null
    isLicenseModalOpen.value = true
  }
}

function openEditSoftware(s: any) {
  selectedSoftware.value = s
  isSoftwareModalOpen.value = true
}

function openEditLicense(l: any) {
  selectedLicense.value = l
  isLicenseModalOpen.value = true
}

const getStatusLabel = (status: string) => {
  const options: Record<string, string> = {
    ACTIVE: 'Đang sử dụng',
    EXPIRED: 'Hết hạn',
    REVOKED: 'Bị thu hồi',
    UNUSED: 'Chưa dùng'
  }
  return options[status] || status
}

const getLicenseTypeLabel = (type: string) => {
  const options: Record<string, string> = {
    PERPETUAL: 'Vĩnh viễn',
    SUBSCRIPTION: 'Kỳ hạn',
    OEM: 'OEM',
    FREEWARE: 'Miễn phí',
    OPEN_SOURCE: 'Nguồn mở'
  }
  return options[type] || type
}

const formatDate = (date: string | null) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}

const getExpiryClass = (date: string | null) => {
  if (!date) return ''
  const expiry = new Date(date)
  const now = new Date()
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'text-error font-bold'
  if (diffDays <= 30) return 'text-warning font-bold'
  return ''
}

watch([activeTab, searchQuery, categoryFilter, statusFilter], () => {
  fetchData()
})

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Phần mềm & License</h1>
        <p class="page-subtitle">Quản lý danh sách phần mềm và bản quyền sử dụng.</p>
      </div>
      <AppButton :label="activeTab === 'software' ? 'Thêm Phần mềm' : 'Thêm License'" variant="primary" @click="openAddModal">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </template>
      </AppButton>
    </div>

    <!-- Tab Switcher -->
    <div class="tabs-nav shadow-sm mb-6">
      <button 
        :class="['tab-link', { 'active': activeTab === 'software' }]" 
        @click="activeTab = 'software'; searchQuery = ''; categoryFilter = ''; statusFilter = ''"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/>
        </svg>
        Danh sách phần mềm
      </button>
      <button 
        :class="['tab-link', { 'active': activeTab === 'licenses' }]" 
        @click="activeTab = 'licenses'; searchQuery = ''; categoryFilter = ''; statusFilter = ''"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        Quản lý Giấy phép (Licenses)
      </button>
    </div>

    <!-- Filters -->
    <div class="filters-card shadow-sm">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="activeTab === 'software' ? 'Tìm tên phần mềm, nhà cung cấp...' : 'Tìm license key, người được gán...'" 
          class="search-input"
        />
      </div>
      
      <div class="filter-group">
        <select v-if="activeTab === 'licenses'" v-model="statusFilter" class="custom-select">
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang sử dụng</option>
          <option value="EXPIRED">Đã hết hạn</option>
          <option value="REVOKED">Bị thu hồi</option>
          <option value="UNUSED">Chưa dùng</option>
        </select>
        <input 
          v-else 
          v-model="categoryFilter" 
          type="text" 
          placeholder="Lọc danh mục..." 
          class="search-input"
          style="width: 200px;"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && softwareList.length === 0 && licenses.length === 0" class="loading-container">
      <div class="spinner-simple"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <!-- Software Tab Content -->
    <div v-else-if="activeTab === 'software'">
      <div v-if="softwareList.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/>
          </svg>
        </div>
        <h3 class="empty-state-title">Chưa có phần mềm nào</h3>
        <AppButton label="Thêm phần mềm mới" variant="secondary" class="mt-4" @click="openAddModal" />
      </div>

      <div v-else class="table-container fade-in">
        <table class="app-table">
          <thead>
            <tr>
              <th>Tên phần mềm</th>
              <th>Nhà cung cấp</th>
              <th>Phiên bản</th>
              <th>Danh mục</th>
              <th>Số License</th>
              <th class="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in softwareList" :key="s.id" @click="goToDetail(s.id)" class="clickable-row">
              <td>
                <div class="info-cell">
                  <span class="info-primary">{{ s.name }}</span>
                  <span class="info-secondary">{{ s.id }}</span>
                </div>
              </td>
              <td><span class="text-secondary">{{ s.vendor || '—' }}</span></td>
              <td><span class="text-primary font-bold">{{ s.version || '—' }}</span></td>
              <td><span class="category-tag">{{ s.category || '—' }}</span></td>
              <td>
                <span class="license-count-badge">
                  {{ s._count?.licenses || 0 }} License
                </span>
              </td>
              <td @click.stop>
                <div class="flex justify-end gap-2">
                  <button class="action-btn" title="Sửa" @click="openEditSoftware(s)">Sửa</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Licenses Tab Content -->
    <div v-else-if="activeTab === 'licenses'">
      <div v-if="licenses.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </div>
        <h3 class="empty-state-title">Chưa có license nào</h3>
        <AppButton label="Thêm License mới" variant="secondary" class="mt-4" @click="openAddModal" />
      </div>

      <div v-else class="table-container fade-in">
        <table class="app-table">
          <thead>
            <tr>
              <th>License Key / ID</th>
              <th>Phần mềm</th>
              <th>Loại</th>
              <th>Trạng thái</th>
              <th>Gán cho / Seats</th>
              <th>Hết hạn</th>
              <th class="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="l in licenses" :key="l.id" class="clickable-row">
              <td>
                <div class="info-cell">
                  <span class="info-primary font-mono text-xs">{{ l.licenseKey || '—' }}</span>
                  <span class="info-secondary">{{ l.id }}</span>
                </div>
              </td>
              <td><span class="text-primary font-bold">{{ l.software?.name }}</span></td>
              <td><span class="text-secondary text-xs">{{ getLicenseTypeLabel(l.type) }}</span></td>
              <td>
                <span :class="['status-badge', `status-${l.status.toLowerCase().replace('_', '-')}`]">
                  {{ getStatusLabel(l.status) }}
                </span>
              </td>
              <td>
                <div class="flex flex-col">
                  <span class="font-medium text-sm">{{ l.assignedTo || 'Chưa gán' }}</span>
                  <span class="text-xs text-muted">{{ l.seats }} Seats</span>
                </div>
              </td>
              <td>
                <span :class="getExpiryClass(l.expiresAt)" class="text-xs">
                  {{ formatDate(l.expiresAt) }}
                </span>
              </td>
              <td @click.stop>
                <div class="flex justify-end gap-2">
                  <button class="action-btn" @click="openEditLicense(l)">Sửa</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <SoftwareModal 
      v-model="isSoftwareModalOpen" 
      :software="selectedSoftware" 
      @save="fetchData" 
    />
    <LicenseModal 
      v-model="isLicenseModalOpen" 
      :license="selectedLicense" 
      @save="fetchData" 
    />
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

/* Tabs */
.tabs-nav {
  display: flex;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 6px;
  width: fit-content;
}

.tab-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  transition: all var(--transition-fast);
  border: none;
  background: transparent;
  cursor: pointer;
}

.tab-link:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
}

.tab-link.active {
  color: var(--color-accent);
  background: var(--color-accent-light);
}

.tab-icon {
  width: 18px;
  height: 18px;
}

/* Filters */
.filters-card {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-md);
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.filter-group {
  display: flex;
  gap: var(--spacing-sm);
}

.custom-select {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 8px 12px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  outline: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 150px;
}

.custom-select:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Table Styles - Standardized */
.table-container {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.app-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.app-table th {
  background: rgba(255, 255, 255, 0.02);
  padding: 16px 20px;
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
}

.app-table td {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.app-table tr:last-child td {
  border-bottom: none;
}

.app-table tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.clickable-row {
  cursor: pointer;
}

/* Info Cells */
.info-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-primary {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.info-secondary {
  font-size: 10px;
  color: var(--color-text-muted);
  font-family: monospace;
}

/* Common UI Elements */
.category-tag {
  background: var(--color-surface);
  color: var(--color-text-primary);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
  border: 1px solid var(--color-border);
}

.license-count-badge {
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-accent);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.status-active { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
.status-expired { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }
.status-revoked { background: rgba(107, 114, 128, 0.1); color: #9ca3af; }
.status-unused { background: rgba(147, 51, 234, 0.1); color: #c084fc; }

.action-btn {
  padding: 6px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
  border-color: var(--color-text-muted);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px var(--spacing-2xl);
  background: var(--color-bg-card);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-xl);
  min-height: 340px;
  text-align: center;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-lg);
  opacity: 0.5;
}

.empty-state-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px;
  gap: var(--spacing-md);
  color: var(--color-text-muted);
}

.spinner-simple {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.1);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.text-error { color: #ef4444; }
.text-warning { color: #f59e0b; }

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }
  .filters-card {
    flex-direction: column;
  }
}
</style>
