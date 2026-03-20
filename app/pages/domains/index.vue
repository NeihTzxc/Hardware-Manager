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
    <div class="filters-card">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="activeTab === 'domains' ? 'Tìm tên miền, nhà đăng ký...' : 'Tìm tên miền, nhà cấp phát...'" 
          class="search-input"
        />
      </div>
      
      <div class="filter-group">
        <select v-model="statusFilter" class="filter-select">
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
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <!-- Domain Tab Content -->
    <div v-else-if="activeTab === 'domains'">
      <div v-if="domains.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <h3>Không tìm thấy tên miền nào</h3>
        <AppButton label="Thêm Tên miền mới" variant="secondary" class="mt-4" @click="openAddModal" />
      </div>

      <div v-else class="domain-grid">
        <div v-for="domain in domains" :key="domain.id" class="domain-card glass-card">
          <div class="card-header">
            <div class="domain-info">
              <div class="domain-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div class="domain-text">
                <NuxtLink :to="`/domains/${domain.id}`" class="domain-name">{{ domain.name }}</NuxtLink>
                <span class="domain-id">{{ domain.id }}</span>
              </div>
            </div>
            <span :class="['status-badge', `status-${domain.status.toLowerCase()}`]">
              {{ getStatusLabel(domain.status, 'domain') }}
            </span>
          </div>

          <div class="card-body">
            <div class="detail-row">
              <span class="detail-label">Nhà đăng ký:</span>
              <span class="detail-value">{{ domain.registrar || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Ngày hết hạn:</span>
              <span :class="['detail-value', getExpiryClass(domain.expiresAt)]">
                {{ formatDate(domain.expiresAt) }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">SSL:</span>
              <span class="detail-value">{{ domain._count?.sslCertificates || 0 }} chứng chỉ</span>
            </div>
          </div>

          <div class="card-footer">
            <div v-if="domain.autoRenew" class="auto-renew-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3 h-3 mr-1">
                <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
              Tự động gia hạn
            </div>
            <div v-else class="manual-renew-tag">Thủ công</div>
            <div class="actions">
              <button class="action-btn" title="Sửa" @click="openEditDomain(domain)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SSL Tab Content -->
    <div v-else-if="activeTab === 'ssl'">
      <div v-if="certificates.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h3>Không tìm thấy chứng chỉ SSL nào</h3>
        <AppButton label="Thêm SSL mới" variant="secondary" class="mt-4" @click="openAddModal" />
      </div>

      <div v-else class="domain-grid">
        <div v-for="ssl in certificates" :key="ssl.id" class="domain-card glass-card">
          <div class="card-header">
            <div class="domain-info">
              <div class="domain-icon" style="background: rgba(99, 102, 241, 0.1); color: var(--color-accent);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div class="domain-text">
                <span class="domain-name">{{ ssl.domainName }}</span>
                <span class="domain-id">{{ ssl.id }}</span>
              </div>
            </div>
            <span :class="['status-badge', `status-${ssl.status.toLowerCase().replace('_', '-')}`]">
              {{ getStatusLabel(ssl.status, 'ssl') }}
            </span>
          </div>

          <div class="card-body">
            <div class="detail-row">
              <span class="detail-label">Nhà cấp phát:</span>
              <span class="detail-value">{{ ssl.issuer || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Loại:</span>
              <span class="detail-value">{{ ssl.type || 'DV' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Ngày hết hạn:</span>
              <span :class="['detail-value', getExpiryClass(ssl.expiresAt)]">
                {{ formatDate(ssl.expiresAt) }}
              </span>
            </div>
            <div v-if="ssl.domain" class="detail-row mt-1 pt-1 border-t border-white/5">
              <span class="detail-label">Domain liên kết:</span>
              <NuxtLink :to="`/domains/${ssl.domainId}`" class="detail-value text-accent hover:underline">
                {{ ssl.domain.name }}
              </NuxtLink>
            </div>
          </div>

          <div class="card-footer">
            <div v-if="ssl.autoRenew" class="auto-renew-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3 mr-1">
                <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
              </svg>
              Trình tự động
            </div>
            <div v-else class="manual-renew-tag">Thủ công</div>
            <div class="actions">
              <button class="action-btn" title="Sửa" @click="openEditSsl(ssl)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
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
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}

.page-subtitle {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
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
  box-shadow: var(--shadow-sm);
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
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  background: var(--color-bg-secondary);
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

.filter-select {
  padding: 10px 12px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  min-width: 180px;
  cursor: pointer;
}

/* Domain Grid */
.domain-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--spacing-xl);
}

.domain-card {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xl);
  border-radius: var(--radius-2xl);
  transition: all var(--transition-base);
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  overflow: hidden;
  position: relative;
}

.domain-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-accent-light);
  box-shadow: var(--shadow-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
}

.domain-info {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.domain-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  background: var(--color-accent-light);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.domain-icon svg {
  width: 24px;
  height: 24px;
}

.domain-name {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.domain-id {
  font-size: 10px;
  color: var(--color-text-muted);
  font-family: monospace;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
}

.detail-label {
  color: var(--color-text-muted);
}

.detail-value {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.auto-renew-tag {
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-success);
  background: rgba(34, 197, 94, 0.1);
  padding: 4px 8px;
  border-radius: var(--radius-md);
}

.manual-renew-tag {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-bg-secondary);
  padding: 4px 8px;
  border-radius: var(--radius-md);
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-accent);
  border-color: var(--color-accent-light);
}

/* Status Badges */
.status-badge {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-active, .status-valid { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
.status-expired { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }
.status-pending, .status-expiring-soon { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }
.status-suspended, .status-revoked { background: rgba(107, 114, 128, 0.1); color: #9ca3af; }

.text-error { color: #ef4444; }
.text-warning { color: #f59e0b; }

/* States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px;
  gap: var(--spacing-md);
  color: var(--color-text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.1);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: var(--color-bg-card);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-2xl);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  color: var(--color-text-muted);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }
  
  .filters-card {
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
}
</style>
