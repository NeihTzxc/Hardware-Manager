<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const api = useApi()
const logs = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const totalPages = ref(1)
const selectedAction = ref('')
const selectedEntity = ref('')

const actionOptions = [
  { label: 'Tất cả hành động', value: '' },
  { label: 'Tạo mới', value: 'CREATE' },
  { label: 'Cập nhật', value: 'UPDATE' },
  { label: 'Xóa', value: 'DELETE' },
  { label: 'Bàn giao', value: 'ASSIGN' },
  { label: 'Thu hồi', value: 'RETURN' },
  { label: 'Bảo trì', value: 'MAINTENANCE' }
]

const entityOptions = [
  { label: 'Tất cả thực thể', value: '' },
  { label: 'Thiết bị', value: 'DEVICE' },
  { label: 'Người dùng', value: 'USER' },
  { label: 'Mượn trả', value: 'ASSIGNMENT' },
  { label: 'Danh mục', value: 'CATEGORY' },
  { label: 'Linh kiện', value: 'COMPONENT' },
  { label: 'Phụ kiện', value: 'ACCESSORY' }
]

async function fetchLogs() {
  loading.value = true
  try {
    const data = await api<any>('/api/audit-logs', {
      params: {
        page: page.value,
        action: selectedAction.value || undefined,
        entity: selectedEntity.value || undefined,
        limit: 15
      }
    })
    logs.value = data.logs
    totalPages.value = data.pagination.totalPages
  } catch (err) {
    console.error('Fetch audit logs error:', err)
  } finally {
    loading.value = false
  }
}

watch([selectedAction, selectedEntity], () => {
  page.value = 1
  fetchLogs()
})

watch(page, () => {
  fetchLogs()
})

onMounted(() => {
  fetchLogs()
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getActionLabel = (action: string) => {
  const options = actionOptions.find(o => o.value === action)
  return options ? options.label : action
}

const getEntityLabel = (entity: string) => {
  const options = entityOptions.find(o => o.value === entity)
  return options ? options.label : entity
}

const selectedLog = ref<any>(null)
const isDetailModalOpen = ref(false)

function viewDetail(log: any) {
  selectedLog.value = log
  isDetailModalOpen.value = true
}

function closeDetail() {
  isDetailModalOpen.value = false
  selectedLog.value = null
}
</script>

<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Lịch sử hoạt động</h1>
        <p class="page-subtitle">Theo dõi các thay đổi và thao tác của người dùng trên hệ thống</p>
      </div>

      <div class="header-actions">
        <select v-model="selectedEntity" class="custom-select">
          <option v-for="opt in entityOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select v-model="selectedAction" class="custom-select">
          <option v-for="opt in actionOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        
        <AppButton icon="refresh" variant="ghost" @click="fetchLogs" :loading="loading" />
      </div>
    </div>

    <div v-if="loading && logs.length === 0" class="loading-container">
      <div class="spinner-simple"></div>
      <p>Đang tải lịch sử...</p>
    </div>

    <div v-else-if="logs.length > 0" class="table-container fade-in">
      <table class="app-table">
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Người thực hiện</th>
            <th>Hành động</th>
            <th>Thực thể</th>
            <th>ID đối tượng</th>
            <th class="text-right">Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id" @click="viewDetail(log)" class="clickable-row">
            <td class="whitespace-nowrap timestamp-cell">{{ formatDate(log.createdAt) }}</td>
            <td>
              <div class="user-cell">
                <span class="font-bold">{{ log.user?.name || 'Hệ thống' }}</span>
                <span class="text-xs text-muted">{{ log.user?.email || 'system@internal' }}</span>
              </div>
            </td>
            <td>
              <span :class="['action-badge', `action-${log.action.toLowerCase()}`]">
                {{ getActionLabel(log.action) }}
              </span>
            </td>
            <td>
              <span class="entity-tag">{{ getEntityLabel(log.entity) }}</span>
            </td>
            <td><code class="entity-id">{{ log.entityId || '—' }}</code></td>
            <td class="text-right">
              <button class="view-btn" @click.stop="viewDetail(log)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination -->
       <div class="pagination-footer" v-if="totalPages > 1">
          <button 
            :disabled="page === 1" 
            @click="page--"
            class="pagination-btn"
          >
            Trước
          </button>
          <div class="page-indicator">
            <span class="current-page">{{ page }}</span>
            <span class="divider">/</span>
            <span class="total-pages">{{ totalPages }}</span>
          </div>
          <button 
            :disabled="page === totalPages" 
            @click="page++"
            class="pagination-btn"
          >
            Sau
          </button>
       </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <h3 class="empty-state-title">Chưa có hoạt động nào</h3>
      <p class="empty-state-desc">Các thao tác trên hệ thống sẽ được ghi lại tại đây.</p>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isDetailModalOpen" class="modal-overlay" @click="closeDetail">
          <div class="modal-wrapper" @click.stop>
            <div class="modal-content">
              <div class="modal-header">
                <div>
                  <h3 class="modal-title">Chi tiết hoạt động</h3>
                  <p class="modal-subtitle">Thông tin chi tiết về thao tác đã ghi nhận</p>
                </div>
                <button class="close-btn" @click="closeDetail">&times;</button>
              </div>
              <div class="modal-body">
                <div class="log-info-grid">
                  <div class="info-item">
                    <label>Người thực hiện</label>
                    <p>{{ selectedLog.user?.name || 'Hệ thống' }} ({{ selectedLog.user?.email || 'N/A' }})</p>
                  </div>
                  <div class="info-item">
                    <label>Thời gian</label>
                    <p>{{ formatDate(selectedLog.createdAt) }}</p>
                  </div>
                  <div class="info-item">
                    <label>Hành động</label>
                    <span :class="['action-badge', `action-${selectedLog.action.toLowerCase()}`]">
                      {{ getActionLabel(selectedLog.action) }}
                    </span>
                  </div>
                  <div class="info-item">
                    <label>Thực thể</label>
                    <p>{{ getEntityLabel(selectedLog.entity) }} (<code>{{ selectedLog.entityId }}</code>)</p>
                  </div>
                </div>

                <div v-if="selectedLog.details" class="details-section">
                  <label class="section-label">Dữ liệu chi tiết</label>
                  <div class="json-container">
                    <pre>{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <AppButton label="Đóng" variant="ghost" @click="closeDetail" />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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
  gap: var(--spacing-lg);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
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
  min-width: 170px;
  transition: all var(--transition-fast);
}

.custom-select:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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

/* Table Styles */
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

.clickable-row {
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.clickable-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.timestamp-cell {
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: var(--font-size-sm);
}

.user-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.entity-tag {
  background: var(--color-surface);
  color: var(--color-text-primary);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
  border: 1px solid var(--color-border);
}

.entity-id {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: monospace;
}

/* Action Badges */
.action-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-md);
  font-size: 11px;
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
.action-login { background: rgba(107, 114, 128, 0.1); color: #9ca3af; }

.view-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.view-btn:hover {
  color: var(--color-accent);
  background: rgba(99, 102, 241, 0.1);
}

/* Pagination */
.pagination-footer {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xl);
  background: rgba(255, 255, 255, 0.01);
}

.pagination-btn {
  padding: 8px 16px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--color-surface-hover);
  border-color: var(--color-text-muted);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.current-page {
  color: var(--color-accent);
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

/* Detail Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-wrapper {
  width: 100%;
  max-width: 800px;
  padding: var(--spacing-md);
}

.modal-content {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-2xl);
  max-height: 90vh;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.modal-subtitle {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.log-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.info-item label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 6px;
  letter-spacing: 0.05em;
}

.info-item p {
  color: var(--color-text-primary);
  font-weight: 500;
}

.details-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

.json-container {
  background: #0f172a;
  border-radius: var(--radius-xl);
  padding: 20px;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.json-container pre {
  color: #94a3b8;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  background: var(--color-surface);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

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

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
