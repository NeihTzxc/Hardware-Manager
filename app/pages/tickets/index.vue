<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import TicketModal from '~/components/modals/TicketModal.vue'
import SearchIcon from '~/components/ui/icons/SearchIcon.vue'
import TicketIcon from '~/components/ui/icons/TicketIcon.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const router = useRouter()
const api = useApi()
const authStore = useAuthStore()

const isAddModalOpen = ref(false)
const tickets = ref<any[]>([])
const loading = ref(false)

const selectedStatus = ref('')
const selectedType = ref('')

const statusOptions = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Mở', value: 'OPEN' },
  { label: 'Đang xử lý', value: 'IN_PROGRESS' },
  { label: 'Đã giải quyết', value: 'RESOLVED' },
  { label: 'Đã đóng', value: 'CLOSED' }
]

const typeOptions = [
  { label: 'Tất cả loại yêu cầu', value: '' },
  { label: 'Yêu cầu thiết bị', value: 'HARDWARE_REQUEST' },
  { label: 'Lỗi thiết bị', value: 'HARDWARE_ISSUE' },
  { label: 'Yêu cầu phần mềm', value: 'SOFTWARE_REQUEST' },
  { label: 'Lỗi phần mềm', value: 'SOFTWARE_ISSUE' },
  { label: 'Khác', value: 'OTHER' }
]

async function fetchTickets() {
  loading.value = true
  try {
    const data = await api<{ success: boolean; tickets: any[] }>('/api/tickets', {
      params: { 
        status: selectedStatus.value || undefined,
        type: selectedType.value || undefined
      }
    })
    tickets.value = data.tickets
  } catch (err) {
    console.error('Fetch tickets error:', err)
  } finally {
    loading.value = false
  }
}

watch([selectedStatus, selectedType], () => {
  fetchTickets()
})

function onTicketSave() {
  fetchTickets()
}

function goToDetail(id: string) {
  router.push(`/tickets/${id}`)
}

onMounted(() => {
  fetchTickets()
})

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    OPEN: 'Mở',
    IN_PROGRESS: 'Đang xử lý',
    RESOLVED: 'Đã giải quyết',
    CLOSED: 'Đã đóng'
  }
  return labels[status] || status
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    HARDWARE_REQUEST: 'YC Thiết bị',
    HARDWARE_ISSUE: 'Lỗi Thiết bị',
    SOFTWARE_REQUEST: 'YC Phần mềm',
    SOFTWARE_ISSUE: 'Lỗi Phần mềm',
    OTHER: 'Khác'
  }
  return labels[type] || type
}

const getPriorityLabel = (p: string) => {
  const labels: Record<string, string> = {
    LOW: 'Thấp',
    MEDIUM: 'Trung bình',
    HIGH: 'Cao',
    URGENT: 'Khẩn cấp'
  }
  return labels[p] || p
}
</script>

<template>
  <div class="page-container wide full-height fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Hỗ trợ / Yêu cầu</h1>
        <p class="page-subtitle">Quản lý và theo dõi các yêu cầu hỗ trợ thiết bị / phần mềm</p>
      </div>

      <div class="header-actions">
        <div class="filter-group">
          <select v-model="selectedType" class="custom-select">
            <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>

          <select v-model="selectedStatus" class="custom-select">
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <AppButton label="Tạo Yêu cầu" variant="primary" @click="isAddModalOpen = true" />
      </div>
    </div>

    <div v-if="loading && tickets.length === 0" class="loading-container">
      <div class="spinner-simple"></div>
      <p>Đang tải danh sách yêu cầu...</p>
    </div>

    <div v-else-if="tickets.length > 0" class="table-container fade-in">
      <table class="app-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Tiêu đề</th>
            <th>Loại</th>
            <th>Mức độ UX</th>
            <th>Trạng thái</th>
            <th>Người yêu cầu</th>
            <th>Ngày tạo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in tickets" :key="ticket.id" @click="goToDetail(ticket.id)" class="clickable-row">
            <td>
              <span class="ticket-id font-mono text-sm text-gray-500">{{ ticket.id }}</span>
            </td>
            <td>
              <span class="font-semibold text-gray-800">{{ ticket.title }}</span>
            </td>
            <td>
              <span class="type-tag">{{ getTypeLabel(ticket.type) }}</span>
            </td>
            <td>
              <span :class="['priority-badge', `priority-${ticket.priority.toLowerCase()}`]">
                {{ getPriorityLabel(ticket.priority) }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', `status-${ticket.status.toLowerCase()}`]">
                {{ getStatusLabel(ticket.status) }}
              </span>
            </td>
            <td>
               <span class="text-sm text-gray-600">{{ ticket.requester?.name || ticket.requester?.email }}</span>
            </td>
            <td>
              <span class="text-sm text-gray-500">{{ new Date(ticket.createdAt).toLocaleDateString('vi-VN') }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">
        <TicketIcon :stroke-width="1.5" />
      </div>
      <h3 class="empty-state-title">Chưa có yêu cầu nào</h3>
      <p class="empty-state-desc">Bạn chưa tạo yêu cầu nào hoặc không có yêu cầu nào khớp với bộ lọc.</p>
      
      <div class="mt-6">
        <AppButton label="Tạo Yêu cầu mới" variant="secondary" @click="isAddModalOpen = true" />
      </div>
    </div>

    <TicketModal v-model="isAddModalOpen" @save="onTicketSave" />
  </div>
</template>

<style scoped>
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

.empty-state-desc {
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
  max-width: 400px;
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

.table-container {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
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

.app-table tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.clickable-row {
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.type-tag {
  background: var(--color-surface);
  color: var(--color-text-primary);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
  border: 1px solid var(--color-border);
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

.status-open {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

.status-in_progress {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
}

.status-resolved {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}

.status-closed {
  background: rgba(107, 114, 128, 0.1);
  color: #9ca3af;
}

/* Priority Badges */
.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.priority-low {
  background: rgba(107, 114, 128, 0.1);
  color: #9ca3af;
}

.priority-medium {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

.priority-high {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
}

.priority-urgent {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

</style>
