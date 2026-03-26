<script setup lang="ts">
import Tabs from '~/components/ui/Tabs.vue'
import AppButton from '~/components/ui/AppButton.vue'
import DomainModal from '~/components/modals/DomainModal.vue'
import SslCertificateModal from '~/components/modals/SslCertificateModal.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const id = route.params.id as string

const domain = ref<any>(null)
const loading = ref(true)
const activeTab = ref('ssl')

const isEditModalOpen = ref(false)
const isSslModalOpen = ref(false)
const selectedSsl = ref<any>(null)

const tabs = [
  { id: 'ssl', label: 'Chứng chỉ SSL', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
  { id: 'dns', label: 'Cấu hình DNS', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>' },
  { id: 'history', label: 'Lịch sử hoạt động', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' }
]

async function fetchDomain() {
  loading.value = true
  try {
    const data = await api<{ success: boolean; domain: any }>(`/api/domains/${id}`)
    domain.value = data.domain
  } catch (err) {
    console.error('Fetch domain error:', err)
  } finally {
    loading.value = false
  }
}

function openAddSslModal() {
  selectedSsl.value = null
  isSslModalOpen.value = true
}

function openEditSslModal(ssl: any) {
  selectedSsl.value = ssl
  isSslModalOpen.value = true
}

async function deleteSsl(sslId: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa chứng chỉ SSL này?')) return
  try {
    await api(`/api/ssl-certificates/${sslId}`, { method: 'DELETE' })
    fetchDomain()
  } catch (err) {
    console.error('Delete SSL error:', err)
  }
}

const getStatusLabel = (status: string) => {
  const options: Record<string, string> = {
    ACTIVE: 'Hoạt động', EXPIRED: 'Hết hạn', PENDING: 'Đang chờ', SUSPENDED: 'Tạm ngưng',
    VALID: 'Hợp lệ', EXPIRING_SOON: 'Sắp hết hạn', REVOKED: 'Đã thu hồi'
  }
  return options[status] || status
}

const formatDate = (date: string | null) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

onMounted(() => {
  fetchDomain()
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
            <NuxtLink to="/domains">Tên miền</NuxtLink>
            <span class="separator">/</span>
            <span>Chi tiết</span>
          </div>
          <h1 class="domain-title" v-if="domain">{{ domain.name }}</h1>
          <div class="skeleton h-8 w-64" v-else></div>
        </div>
      </div>

      <div class="header-actions" v-if="domain">
        <AppButton label="Sửa Tên miền" variant="secondary" @click="isEditModalOpen = true" />
        <AppButton label="Thêm SSL Cert" variant="primary" @click="openAddSslModal" />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner-simple"></div>
      <p>Đang tải thông tin tên miền...</p>
    </div>

    <div v-else-if="domain" class="detail-grid">
      <!-- Left Column -->
      <div class="main-column">
        <div class="info-card stats-card">
          <div class="stat-item">
            <span class="stat-label">Trạng thái Domain</span>
            <span :class="['status-badge', `status-${domain.status.toLowerCase()}`]">
              {{ getStatusLabel(domain.status) }}
            </span>
          </div>
          <div class="stat-item border-l border-r border-white/5">
            <span class="stat-label">Nhà đăng ký</span>
            <span class="stat-value">{{ domain.registrar || 'Chưa xác định' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Ngày hết hạn</span>
            <span class="stat-value text-accent">{{ formatDate(domain.expiresAt) }}</span>
          </div>
        </div>

        <div class="info-card">
          <h2 class="card-title">Thông tin đăng ký</h2>
          <div class="details-grid">
            <div class="detail-item">
              <label>ID Hệ thống</label>
              <span>{{ domain.id }}</span>
            </div>
            <div class="detail-item">
              <label>Tên miền</label>
              <span class="font-bold">{{ domain.name }}</span>
            </div>
            <div class="detail-item">
              <label>Ngày đăng ký</label>
              <span>{{ formatDate(domain.registeredAt) }}</span>
            </div>
            <div class="detail-item">
              <label>Tự động gia hạn</label>
              <span :class="domain.autoRenew ? 'text-success' : 'text-muted'">
                {{ domain.autoRenew ? 'Bật' : 'Tắt' }}
              </span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-white/5">
            <label class="block text-xs text-muted mb-2">Ghi chú</label>
            <p class="text-sm italic text-secondary">{{ domain.notes || 'Không có ghi chú.' }}</p>
          </div>
        </div>

        <!-- DNS Tab Content -->
        <div v-if="activeTab === 'dns'" class="info-card">
          <h2 class="card-title">Cấu hình DNS</h2>
          <div class="details-grid">
            <div class="detail-item">
              <label>DNS Provider</label>
              <span>{{ domain.dnsProvider || '—' }}</span>
            </div>
            <div class="detail-item full-width">
              <label>Nameservers</label>
              <div class="ns-list" v-if="domain.nameservers">
                <code v-for="ns in domain.nameservers.split(',')" :key="ns" class="ns-item">{{ ns.trim() }}</code>
              </div>
              <span v-else>—</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="side-column">
        <div class="info-card tabs-card">
          <Tabs v-model="activeTab" :tabs="tabs">
            <!-- SSL Certificates -->
            <div v-if="activeTab === 'ssl'" class="tab-content">
              <div v-if="domain.sslCertificates.length === 0" class="empty-list">
                Chưa có chứng chỉ SSL nào.
              </div>
              <div v-else class="ssl-list">
                <div v-for="ssl in domain.sslCertificates" :key="ssl.id" class="ssl-item glass-card">
                  <div class="ssl-header">
                    <div class="ssl-meta">
                      <span class="ssl-issuer font-bold">{{ ssl.issuer || 'Unknown Issuer' }}</span>
                      <span class="ssl-type text-xs text-muted">{{ ssl.type || 'DV' }}</span>
                    </div>
                    <span :class="['status-badge status-sm', `status-${ssl.status.toLowerCase().replace('_', '-')}`]">
                      {{ getStatusLabel(ssl.status) }}
                    </span>
                  </div>
                  <div class="ssl-dates">
                    <div class="date-row">
                      <span>Cấp ngày:</span>
                      <span>{{ formatDate(ssl.issuedAt) }}</span>
                    </div>
                    <div class="date-row">
                      <span>Hết hạn:</span>
                      <span class="font-bold" :class="ssl.status === 'VALID' ? 'text-success' : 'text-error'">
                        {{ formatDate(ssl.expiresAt) }}
                      </span>
                    </div>
                  </div>
                  <div class="ssl-actions mt-3 flex justify-end gap-2">
                    <button class="icon-btn" @click="openEditSslModal(ssl)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="icon-btn text-error hover:bg-error/10" @click="deleteSsl(ssl.id)">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- History Placeholder -->
            <div v-if="activeTab === 'history'" class="tab-content flex items-center justify-center py-10 text-muted italic">
              Tính năng đang phát triển...
            </div>
          </Tabs>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <DomainModal v-if="domain" v-model="isEditModalOpen" :domain="domain" @save="fetchDomain" />
    <SslCertificateModal 
      v-model="isSslModalOpen" 
      :domainId="domain?.id" 
      :certificate="selectedSsl" 
      @save="fetchDomain" 
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

.ns-list { display: flex; flex-direction: column; gap: 4px; margin-top: 4px; }
.ns-item {
  padding: 4px 8px; background: var(--color-bg-secondary);
  border-radius: 4px; font-size: 11px; font-family: monospace;
}

/* SSL List */
.ssl-list { display: flex; flex-direction: column; gap: var(--spacing-md); }

.ssl-item {
  padding: var(--spacing-md); border-radius: var(--radius-lg);
  background: var(--color-surface); border: 1px solid var(--color-border);
}

.ssl-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: var(--spacing-md);
}

.ssl-meta { display: flex; flex-direction: column; }

.ssl-dates { display: flex; flex-direction: column; gap: 4px; }
.date-row {
  display: flex; justify-content: space-between; font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.icon-btn {
  width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--color-border);
  background: transparent; color: var(--color-text-muted);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all var(--transition-fast);
}

.icon-btn:hover { background: var(--color-surface-hover); color: var(--color-text-primary); }

.status-badge {
  padding: 4px 8px; border-radius: var(--radius-full);
  font-size: 10px; font-weight: 700; text-transform: uppercase;
}
.status-sm { padding: 2px 6px; font-size: 9px; }

.status-valid { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
.status-expiring-soon { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }
.status-expired { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }
.status-revoked { background: rgba(107, 114, 128, 0.1); color: #9ca3af; }

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
