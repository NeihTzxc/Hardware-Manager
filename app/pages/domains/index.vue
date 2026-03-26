<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import DomainModal from '~/components/modals/DomainModal.vue'
import SslCertificateModal from '~/components/modals/SslCertificateModal.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const api = useApi()
const activeTab = ref<'domains' | 'ssl'>('domains')
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('')

// Domain data
const domains = ref<any[]>([])
const isDomainModalOpen = ref(false)
const selectedDomain = ref<any>(null)

// SSL data
const certificates = ref<any[]>([])
const isSslModalOpen = ref(false)
const selectedSsl = ref<any>(null)

async function fetchData() {
  loading.value = true
  try {
    if (activeTab.value === 'domains') {
      const data = await api<{ success: boolean; domains: any[] }>('/api/domains', {
        params: { 
          q: searchQuery.value,
          status: statusFilter.value
        }
      })
      domains.value = data.domains
    } else {
      const data = await api<{ success: boolean; certificates: any[] }>('/api/ssl-certificates', {
        params: {
          q: searchQuery.value,
          status: statusFilter.value
        }
      })
      certificates.value = data.certificates
    }
  } catch (err) {
    console.error('Fetch data error:', err)
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  if (activeTab.value === 'domains') {
    selectedDomain.value = null
    isDomainModalOpen.value = true
  } else {
    selectedSsl.value = null
    isSslModalOpen.value = true
  }
}

function openEditDomain(domain: any) {
  selectedDomain.value = domain
  isDomainModalOpen.value = true
}

function openEditSsl(ssl: any) {
  selectedSsl.value = ssl
  isSslModalOpen.value = true
}

const getStatusLabel = (status: string, type: 'domain' | 'ssl') => {
  if (type === 'domain') {
    const options: Record<string, string> = {
      ACTIVE: 'Hoạt động',
      EXPIRED: 'Hết hạn',
      PENDING: 'Đang chờ',
      SUSPENDED: 'Tạm ngưng'
    }
    return options[status] || status
  } else {
    const options: Record<string, string> = {
      VALID: 'Hợp lệ',
      EXPIRING_SOON: 'Sắp hết hạn',
      EXPIRED: 'Hết hạn',
      REVOKED: 'Đã thu hồi'
    }
    return options[status] || status
  }
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

watch([activeTab, searchQuery, statusFilter], () => {
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
        <h1 class="page-title">Hạ tầng Web</h1>
        <p class="page-subtitle">Quản lý tên miền và chứng chỉ bảo mật hệ thống.</p>
      </div>
      <AppButton :label="activeTab === 'domains' ? 'Thêm Tên miền' : 'Thêm SSL'" variant="primary" @click="openAddModal">
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
        :class="['tab-link', { 'active': activeTab === 'domains' }]" 
        @click="activeTab = 'domains'; searchQuery = ''; statusFilter = ''"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        Tên miền (Domains)
      </button>
      <button 
        :class="['tab-link', { 'active': activeTab === 'ssl' }]" 
        @click="activeTab = 'ssl'; searchQuery = ''; statusFilter = ''"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Chứng chỉ SSL (Certificates)
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
          :placeholder="activeTab === 'domains' ? 'Tìm tên miền...' : 'Tìm domain, issuer...'" 
          class="search-input"
        />
      </div>
      
      <div class="filter-group">
        <select v-model="statusFilter" class="custom-select">
          <option value="">Tất cả trạng thái</option>
          <template v-if="activeTab === 'domains'">
            <option value="ACTIVE">Hoạt động</option>
            <option value="EXPIRED">Hết hạn</option>
            <option value="PENDING">Đang chờ</option>
            <option value="SUSPENDED">Tạm ngưng</option>
          </template>
          <template v-else>
            <option value="VALID">Hợp lệ</option>
            <option value="EXPIRING_SOON">Sắp hết hạn</option>
            <option value="EXPIRED">Đã hết hạn</option>
            <option value="REVOKED">Đã bị thu hồi</option>
          </template>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading && domains.length === 0 && certificates.length === 0" class="loading-container">
      <div class="spinner-simple"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <!-- Domain Tab Content -->
    <div v-else-if="activeTab === 'domains'">
      <div v-if="domains.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <h3 class="empty-state-title">Không tìm thấy tên miền nào</h3>
        <AppButton label="Thêm Tên miền mới" variant="secondary" class="mt-4" @click="openAddModal" />
      </div>

      <div v-else class="table-container fade-in">
        <table class="app-table">
          <thead>
            <tr>
              <th>Tên miền</th>
              <th>Nhà đăng ký</th>
              <th>Ngày hết hạn</th>
              <th>Gia hạn</th>
              <th>SSL</th>
              <th>Trạng thái</th>
              <th class="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="domain in domains" :key="domain.id" @click="$router.push(`/domains/${domain.id}`)" class="clickable-row">
              <td>
                <div class="info-cell">
                  <span class="info-primary">{{ domain.name }}</span>
                  <span class="info-secondary">{{ domain.id }}</span>
                </div>
              </td>
              <td><span class="text-secondary text-sm">{{ domain.registrar || '—' }}</span></td>
              <td>
                <span :class="['text-sm', getExpiryClass(domain.expiresAt)]">
                  {{ formatDate(domain.expiresAt) }}
                </span>
              </td>
              <td>
                <span v-if="domain.autoRenew" class="compact-tag text-green-400">Tự động</span>
                <span v-else class="compact-tag text-muted">Thủ công</span>
              </td>
              <td>
                <span class="count-tag">{{ domain._count?.sslCertificates || 0 }}</span>
              </td>
              <td>
                <span :class="['status-badge', `status-${domain.status.toLowerCase()}`]">
                  {{ getStatusLabel(domain.status, 'domain') }}
                </span>
              </td>
              <td @click.stop>
                <div class="flex justify-end gap-2">
                  <button class="action-btn" @click="openEditDomain(domain)">Sửa</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- SSL Tab Content -->
    <div v-else-if="activeTab === 'ssl'">
      <div v-if="certificates.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h3 class="empty-state-title">Không tìm thấy chứng chỉ SSL nào</h3>
        <AppButton label="Thêm SSL mới" variant="secondary" class="mt-4" @click="openAddModal" />
      </div>

      <div v-else class="table-container fade-in">
        <table class="app-table">
          <thead>
            <tr>
              <th>Tên miền</th>
              <th>Nhà cấp phát</th>
              <th>Loại</th>
              <th>Ngày hết hạn</th>
              <th>Gia hạn</th>
              <th>Trạng thái</th>
              <th class="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ssl in certificates" :key="ssl.id" class="clickable-row">
              <td>
                <div class="info-cell">
                  <span class="info-primary">{{ ssl.domainName }}</span>
                  <span class="info-secondary">{{ ssl.id }}</span>
                </div>
              </td>
              <td><span class="text-secondary text-sm">{{ ssl.issuer || '—' }}</span></td>
              <td><span class="text-muted text-xs font-bold">{{ ssl.type || 'DV' }}</span></td>
              <td>
                <span :class="['text-sm', getExpiryClass(ssl.expiresAt)]">
                  {{ formatDate(ssl.expiresAt) }}
                </span>
              </td>
              <td>
                <span v-if="ssl.autoRenew" class="compact-tag text-green-400">Tự động</span>
                <span v-else class="compact-tag text-muted">Thủ công</span>
              </td>
              <td>
                <span :class="['status-badge', `status-${ssl.status.toLowerCase().replace('_', '-')}`]">
                  {{ getStatusLabel(ssl.status, 'ssl') }}
                </span>
              </td>
              <td @click.stop>
                <div class="flex justify-end gap-2">
                  <button class="action-btn" @click="openEditSsl(ssl)">Sửa</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <DomainModal 
      v-model="isDomainModalOpen" 
      :domain="selectedDomain" 
      @save="fetchData" 
    />
    <SslCertificateModal 
      v-model="isSslModalOpen" 
      :certificate="selectedSsl" 
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

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.status-active, .status-valid { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
.status-expired { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }
.status-pending, .status-expiring-soon { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }
.status-suspended, .status-revoked { background: rgba(107, 114, 128, 0.1); color: #9ca3af; }

/* Action Buttons */
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

/* Common Tags */
.compact-tag {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.count-tag {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 2px 8px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
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
