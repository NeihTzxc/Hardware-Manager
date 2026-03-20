<script setup lang="ts">
import Tabs from '~/components/ui/Tabs.vue'
import AppButton from '~/components/ui/AppButton.vue'
import DeviceModal from '~/components/modals/DeviceModal.vue'
import BorrowModal from '~/components/modals/BorrowModal.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const id = route.params.id as string

const device = ref<any>(null)
const loading = ref(true)
const activeTab = ref('assignments')

const isEditModalOpen = ref(false)
const isBorrowModalOpen = ref(false)

const tabs = [
  { id: 'assignments', label: 'Lịch sử cấp phát', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
  { id: 'maintenance', label: 'Bảo trì', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>' },
  { id: 'components', label: 'Linh kiện', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>' },
  { id: 'history', label: 'Lịch sử chỉnh sửa', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' }
]

async function fetchDevice() {
  loading.value = true
  try {
    const data = await api<{ success: boolean; device: any }>(`/api/devices/${id}`)
    device.value = data.device
  } catch (err) {
    console.error('Fetch device detail error:', err)
  } finally {
    loading.value = false
  }
}

function onDeviceSave() {
  fetchDevice()
  auditLogs.value = [] // Reset logs to force refetch
  if (activeTab.value === 'history') {
    fetchAuditLogs()
  }
}

const auditLogs = ref<any[]>([])
const loadingLogs = ref(false)

async function fetchAuditLogs() {
  if (auditLogs.value.length > 0) return
  loadingLogs.value = true
  try {
    const data = await api<{ success: boolean; logs: any[] }>('/api/audit-logs', {
      params: { entity: 'DEVICE', entityId: id, limit: 50 }
    })
    auditLogs.value = data.logs
  } catch (err) {
    console.error('Fetch audit logs error:', err)
  } finally {
    loadingLogs.value = false
  }
}

watch(activeTab, (newTab) => {
  if (newTab === 'history') {
    fetchAuditLogs()
  }
})

const getActionLabel = (action: string) => {
  const options: Record<string, string> = {
    CREATE: 'Tạo mới',
    UPDATE: 'Cập nhật',
    DELETE: 'Xóa',
    ASSIGN: 'Bàn giao',
    RETURN: 'Thu hồi',
    MAINTENANCE: 'Bảo trì'
  }
  return options[action] || action
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    AVAILABLE: 'Sẵn sàng',
    IN_USE: 'Đang sử dụng',
    MAINTENANCE: 'Bảo trì',
    RETIRED: 'Ngừng sử dụng',
    LOST: 'Mất'
  }
  return labels[status] || status
}

const getConditionLabel = (condition: string) => {
  const labels: Record<string, string> = {
    NEW: 'Mới',
    GOOD: 'Tốt',
    FAIR: 'Bình thường',
    POOR: 'Kém',
    DAMAGED: 'Hỏng'
  }
  return labels[condition] || condition
}

const formatDate = (date: string | null) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const formatCurrency = (amount: number | null) => {
  if (amount === null) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

onMounted(() => {
  fetchDevice()
})
</script>

<template>
  <div class="page-container fade-in">
    <!-- Header/Navigation -->
    <div class="detail-header">
      <div class="flex items-center gap-4">
        <button class="back-btn" @click="router.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div>
          <div class="breadcrumb">
            <NuxtLink to="/devices">Thiết bị</NuxtLink>
            <span class="separator">/</span>
            <span>Chi tiết</span>
          </div>
          <h1 class="device-title" v-if="device">{{ device.name }}</h1>
          <div class="skeleton h-8 w-64" v-else></div>
        </div>
      </div>

      <div class="header-actions" v-if="device">
        <AppButton label="Sửa thông tin" variant="secondary" @click="isEditModalOpen = true" />
        <AppButton v-if="device.status === 'AVAILABLE'" label="Cấp phát (Mượn)" variant="primary" @click="isBorrowModalOpen = true" />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner-simple"></div>
      <p>Đang tải thông tin thiết bị...</p>
    </div>

    <div v-else-if="device" class="detail-grid">
      <!-- Left Column: Main Info -->
      <div class="main-column">
        <!-- Quick Stats Card -->
        <div class="info-card stats-card">
          <div class="stat-item">
            <span class="stat-label">Trạng thái</span>
            <span :class="['status-badge', `status-${device.status.toLowerCase()}`]">
              {{ getStatusLabel(device.status) }}
            </span>
          </div>
          <div class="stat-item border-l border-r border-white/5">
            <span class="stat-label">Vị trí hiện tại</span>
            <span class="stat-value">{{ device.location?.name || 'Chưa xác định' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Người đang sử dụng</span>
            <span class="stat-value text-accent">{{ device.assignments.find((a: any) => !a.returnedAt)?.user?.name || '—' }}</span>
          </div>
        </div>

        <!-- Details Card -->
        <div class="info-card">
          <h2 class="card-title">Thông tin cơ bản</h2>
          <div class="details-grid">
            <div class="detail-item">
              <label>ID Thiết bị</label>
              <span>{{ device.id }}</span>
            </div>
            <div class="detail-item">
              <label>Số Serial</label>
              <span>{{ device.serialNumber }}</span>
            </div>
            <div class="detail-item">
              <label>Danh mục</label>
              <span class="category-tag">{{ device.category?.name }}</span>
            </div>
            <div class="detail-item">
              <label>Model</label>
              <span>{{ device.model || '—' }}</span>
            </div>
            <div class="detail-item">
              <label>Hãng sản xuất</label>
              <span>{{ device.manufacturer || '—' }}</span>
            </div>
            <div class="detail-item">
              <label>Tình trạng</label>
              <span>{{ getConditionLabel(device.condition) }}</span>
            </div>
          </div>
        </div>

        <!-- Procurement Card -->
        <div class="info-card">
          <h2 class="card-title">Thông tin nhập thiết bị</h2>
          <div class="details-grid">
            <div class="detail-item">
              <label>Nhà cung cấp</label>
              <span>{{ device.supplier?.name || '—' }}</span>
            </div>
            <div class="detail-item">
              <label>Ngày mua</label>
              <span>{{ formatDate(device.purchaseDate) }}</span>
            </div>
            <div class="detail-item">
              <label>Giá mua</label>
              <span>{{ formatCurrency(device.purchasePrice) }}</span>
            </div>
            <div class="detail-item">
              <label>Hạn bảo hành</label>
              <span>{{ formatDate(device.warrantyExpiry) }}</span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-white/5">
            <label class="block text-xs text-muted mb-2">Ghi chú</label>
            <p class="text-sm italic text-secondary">{{ device.notes || 'Không có ghi chú.' }}</p>
          </div>
        </div>
      </div>

      <!-- Right Column: History & Components -->
      <div class="side-column">
        <div class="info-card history-card">
          <Tabs v-model="activeTab" :tabs="tabs">
            <!-- Assignment History -->
            <div v-if="activeTab === 'assignments'" class="history-content">
              <div v-if="device.assignments.length === 0" class="empty-history">
                Chưa có lịch sử cấp phát.
              </div>
              <div v-else class="timeline">
                <div v-for="assignment in device.assignments" :key="assignment.id" class="timeline-item">
                  <div class="timeline-dot" :class="{ 'active': !assignment.returnedAt }"></div>
                  <div class="timeline-body">
                    <div class="flex justify-between items-start">
                      <span class="user-name">{{ assignment.user.name }}</span>
                      <span v-if="!assignment.returnedAt" class="current-tag">Đang giữ</span>
                    </div>
                    <div class="timeline-dates">
                      <span>{{ formatDate(assignment.assignedAt) }}</span>
                      <span v-if="assignment.returnedAt"> → {{ formatDate(assignment.returnedAt) }}</span>
                    </div>
                    <p v-if="assignment.notes" class="timeline-notes">{{ assignment.notes }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Maintenance History -->
            <div v-if="activeTab === 'maintenance'" class="history-content">
              <div v-if="device.maintenances.length === 0" class="empty-history">
                Chưa có lịch sử bảo trì.
              </div>
              <div v-else class="maintenance-list">
                <div v-for="log in device.maintenances" :key="log.id" class="maintenance-item">
                  <div class="maintenance-header">
                    <span class="maintenance-type">{{ log.type }}</span>
                    <span class="maintenance-date">{{ formatDate(log.performedAt) }}</span>
                  </div>
                  <p class="maintenance-desc">{{ log.description }}</p>
                  <div class="maintenance-footer">
                    <span>Thực hiện bởi: {{ log.performedBy?.name || '—' }}</span>
                    <span v-if="log.cost" class="maintenance-cost">{{ formatCurrency(log.cost) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Components List -->
            <div v-if="activeTab === 'components'" class="history-content">
              <div v-if="device.components.length === 0" class="empty-history">
                Không có linh kiện nào được cài đặt.
              </div>
              <div v-else class="component-list">
                <div v-for="comp in device.components" :key="comp.id" class="comp-item">
                  <div class="comp-info">
                    <span class="comp-name">{{ comp.name }}</span>
                    <span class="comp-cat">{{ comp.category?.name }}</span>
                  </div>
                  <span :class="['status-badge status-sm', `status-${comp.status.toLowerCase()}`]">
                    {{ comp.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Edit History List -->
            <div v-if="activeTab === 'history'" class="history-content">
              <div v-if="loadingLogs" class="loading-state h-48 py-8">
                <div class="spinner-simple"></div>
              </div>
              <div v-else-if="auditLogs.length === 0" class="empty-history">
                Không có lịch sử chỉnh sửa hoặc hoạt động liên quan.
              </div>
              <div v-else class="timeline">
                <div v-for="log in auditLogs" :key="log.id" class="timeline-item">
                  <div class="timeline-dot" :class="{ 'active': log.action === 'CREATE' }"></div>
                  <div class="timeline-body">
                    <div class="flex justify-between items-start">
                      <span class="user-name">{{ log.user?.name || log.user?.email || 'Hệ thống' }}</span>
                      <span :class="['action-badge', `action-${log.action.toLowerCase()}`]">
                        {{ getActionLabel(log.action) }}
                      </span>
                    </div>
                    <div class="timeline-dates mb-2">
                       {{ formatDate(log.createdAt) }}
                    </div>
                    <div v-if="log.action === 'UPDATE' && log.details?.new" class="timeline-notes text-xs">
                       <p class="font-bold mb-1 border-b border-white/10 pb-1">Chi tiết thay đổi:</p>
                       <ul class="list-disc pl-4 space-y-1 mt-1">
                         <li v-if="log.details.old.name !== log.details.new.name">Tên: <span class="line-through opacity-50">{{ log.details.old.name }}</span> → <span class="text-accent">{{ log.details.new.name }}</span></li>
                         <li v-if="log.details.old.status !== log.details.new.status">Trạng thái: <span class="line-through opacity-50">{{ getStatusLabel(log.details.old.status) }}</span> → <span class="text-accent">{{ getStatusLabel(log.details.new.status) }}</span></li>
                         <li v-if="log.details.old.condition !== log.details.new.condition">Tình trạng: <span class="line-through opacity-50">{{ getConditionLabel(log.details.old.condition) }}</span> → <span class="text-accent">{{ getConditionLabel(log.details.new.condition) }}</span></li>
                         <li v-if="log.details.old.serialNumber !== log.details.new.serialNumber">Serial: <span class="line-through opacity-50">{{ log.details.old.serialNumber }}</span> → <span class="text-accent">{{ log.details.new.serialNumber }}</span></li>
                         <li v-if="log.details.old.notes !== log.details.new.notes">Ghi chú đã được cập nhật</li>
                         <template v-if="log.details.old.name === log.details.new.name &&
                                         log.details.old.status === log.details.new.status &&
                                         log.details.old.condition === log.details.new.condition &&
                                         log.details.old.serialNumber === log.details.new.serialNumber &&
                                         log.details.old.notes === log.details.new.notes">
                           <li class="italic text-muted list-none -ml-4">Cập nhật thông tin chi tiết</li>
                         </template>
                       </ul>
                    </div>
                    <div v-else-if="log.action === 'CREATE'" class="timeline-notes text-xs">
                      Đã thêm thiết bị vào hệ thống.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>

    <div v-else class="error-state">
      <h2 class="text-xl font-bold mb-2">Lỗi</h2>
      <p>Không tìm thấy thông tin thiết bị này.</p>
      <AppButton label="Quay lại danh sách" variant="ghost" class="mt-4" @click="router.push('/devices')" />
    </div>

    <!-- Modals -->
    <DeviceModal v-if="device" v-model="isEditModalOpen" :device="device" @save="onDeviceSave" />
    <BorrowModal v-if="device" v-model="isBorrowModalOpen" :device="device" @save="onDeviceSave" />
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-2xl);
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.back-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
  border-color: var(--color-text-muted);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.breadcrumb a {
  text-decoration: none;
  color: inherit;
  transition: color var(--transition-fast);
}

.breadcrumb a:hover {
  color: var(--color-accent);
}

.separator {
  opacity: 0.5;
}

.device-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: var(--spacing-xl);
}

@media (max-width: 1024px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
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
  font-size: var(--font-size-base);
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
  position: relative;
  display: inline-block;
}

.card-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 20px;
  height: 2px;
  background: var(--color-accent);
  border-radius: 2px;
}

.stats-card {
  display: flex;
  padding: 0;
  overflow: hidden;
}

.stat-item {
  flex: 1;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.stat-value {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
}

.text-accent {
  color: var(--color-accent);
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.detail-item span {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.category-tag {
  background: var(--color-surface);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  width: fit-content;
}

/* History Styles */
.history-card {
  height: fit-content;
  position: sticky;
  top: var(--spacing-xl);
}

.history-content {
  min-height: 200px;
}

.empty-history {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  position: relative;
  padding-left: 20px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: var(--color-border);
}

.timeline-item {
  position: relative;
}

.timeline-dot {
  position: absolute;
  left: -20px;
  top: 6px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-border);
  border: 2px solid var(--color-bg-card);
  z-index: 1;
}

.timeline-dot.active {
  background: var(--color-accent);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text-primary);
}

.current-tag {
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-accent);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.timeline-dates {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.timeline-notes {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  background: var(--color-surface);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-sm);
}

/* Maintenance List */
.maintenance-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.maintenance-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}

.maintenance-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.maintenance-type {
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--color-text-primary);
  text-transform: uppercase;
}

.maintenance-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.maintenance-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.maintenance-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-muted);
}

.maintenance-cost {
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Component List */
.component-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.comp-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.comp-info {
  display: flex;
  flex-direction: column;
}

.comp-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.comp-cat {
  font-size: 10px;
  color: var(--color-text-muted);
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

.status-sm {
  padding: 2px 8px;
  font-size: 9px;
}

.status-available { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
.status-in_use { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
.status-maintenance { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }
.status-retired { background: rgba(107, 114, 128, 0.1); color: #9ca3af; }
.status-lost { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }

/* Action Badges for history */
.action-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-md);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.action-create { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
.action-update { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
.action-delete { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }
.action-assign { background: rgba(168, 85, 247, 0.1); color: #c084fc; }
.action-return { background: rgba(20, 184, 166, 0.1); color: #2dd4bf; }
.action-maintenance { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }

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

.spinner-simple {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.1);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.error-state {
  text-align: center;
  padding: 100px;
  color: var(--color-text-muted);
}

.skeleton {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>
