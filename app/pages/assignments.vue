<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppDialog from '~/components/ui/AppDialog.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const api = useApi()
const { success, error: notifyError } = useNotification()

const assignments = ref<any[]>([])
const loading = ref(false)
const returning = ref(false)

// Return Device Modal State
const isReturnModalOpen = ref(false)
const selectedAssignment = ref<any>(null)
const returnForm = reactive({
  conditionAfter: 'GOOD',
  notes: ''
})

const conditions = [
  { value: 'NEW', label: 'Mới' },
  { value: 'GOOD', label: 'Tốt' },
  { value: 'FAIR', label: 'Trung bình' },
  { value: 'POOR', label: 'Kém' },
  { value: 'DAMAGED', label: 'Hỏng' }
]

async function fetchAssignments() {
  loading.value = true
  try {
    const data = await api<{ success: boolean; assignments: any[] }>('/api/assignments')
    assignments.value = data.assignments
  } catch (err) {
    console.error('Fetch assignments error:', err)
  } finally {
    loading.value = false
  }
}

function openReturnModal(assignment: any) {
  selectedAssignment.value = assignment
  returnForm.conditionAfter = assignment.device.condition || 'GOOD'
  returnForm.notes = ''
  isReturnModalOpen.value = true
}

async function handleReturn() {
  if (!selectedAssignment.value) return

  returning.value = true
  try {
    const data = await api<{ success: boolean }>(`/api/assignments/${selectedAssignment.value.id}/return`, {
      method: 'PUT',
      body: returnForm
    })

    if (data.success) {
      success('Thành công', 'Thiết bị đã được trả thành công')
      isReturnModalOpen.value = false
      fetchAssignments()
    }
  } catch (err: any) {
    const msg = err.data?.message || 'Có lỗi xảy ra khi thực hiện trả thiết bị'
    notifyError('Lỗi', msg)
  } finally {
    returning.value = false
  }
}

const getConditionLabel = (condition: string) => {
  const labels: Record<string, string> = {
    NEW: 'Mới',
    GOOD: 'Tốt',
    FAIR: 'Trung bình',
    POOR: 'Kém',
    DAMAGED: 'Hỏng'
  }
  return labels[condition] || condition
}

onMounted(() => {
  fetchAssignments()
})
</script>

<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Quản lý mượn trả</h1>
        <p class="page-subtitle">Theo dõi lịch sử cấp phát và thu hồi thiết bị</p>
      </div>
    </div>

    <div v-if="loading && assignments.length === 0" class="loading-container">
      <div class="spinner-simple"></div>
      <p>Đang tải lịch sử mượn trả...</p>
    </div>

    <div v-else-if="assignments.length > 0" class="table-container fade-in">
      <table class="app-table">
        <thead>
          <tr>
            <th>Thiết bị</th>
            <th>Người mượn</th>
            <th>Ngày mượn</th>
            <th>Ngày trả</th>
            <th>Tình trạng</th>
            <th class="text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in assignments" :key="item.id">
            <td>
              <div class="device-info">
                <span class="font-bold text-sm">{{ item.device.name }}</span>
                <span class="text-xs text-muted">{{ item.device.serialNumber }}</span>
              </div>
            </td>
            <td>
              <div class="user-info">
                <span class="text-sm font-bold">{{ item.user.name || 'N/A' }}</span>
              </div>
            </td>
            <td>
              <span class="text-xs">{{ new Date(item.assignedAt).toLocaleDateString('vi-VN') }}</span>
            </td>
            <td>
              <span v-if="item.returnedAt" class="text-xs text-success">
                {{ new Date(item.returnedAt).toLocaleDateString('vi-VN') }}
              </span>
              <span v-else class="text-xs text-warning font-semibold">Đang mượn</span>
            </td>
            <td>
              <div class="flex flex-col gap-1">
                <span class="text-xs mb-1">Lúc mượn: <b>{{ getConditionLabel(item.conditionBefore) }}</b></span>
                <br>
                <span v-if="item.returnedAt" class="text-xs">Lúc trả: <b>{{ getConditionLabel(item.conditionAfter)
                    }}</b></span>
              </div>
            </td>
            <td>
              <div class="flex justify-end">
                <button v-if="!item.returnedAt" class="action-btn-primary" @click="openReturnModal(item)">
                  Trả máy
                </button>
                <div v-else class="text-xs text-muted italic">Hoàn thành</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      </div>
      <h3 class="empty-state-title">Chưa có lịch sử mượn trả</h3>
      <p class="empty-state-desc">Hãy bắt đầu bằng cách cấp phát thiết bị cho nhân viên.</p>
    </div>

    <!-- Return Modal -->
    <AppDialog v-model="isReturnModalOpen" title="Thu hồi thiết bị" size="md">
      <div v-if="selectedAssignment" class="space-y-4">
        <div class="p-3 bg-surface rounded-lg border border-border">
          <div class="text-xs text-muted uppercase font-bold mb-1">Thông tin thiết bị</div>
          <div class="font-bold text-sm">{{ selectedAssignment.device.name }}</div>
          <div class="text-xs text-muted">{{ selectedAssignment.device.serialNumber }}</div>
          <div class="mt-2 text-xs">Người mượn: <b>{{ selectedAssignment.user.name || selectedAssignment.user.email
              }}</b></div>
        </div>

        <AppFormControl label="Tình trạng lúc trả" id="return-condition">
          <select v-model="returnForm.conditionAfter" id="return-condition">
            <option v-for="c in conditions" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </AppFormControl>

        <AppFormControl label="Ghi chú trả máy" id="return-notes">
          <textarea v-model="returnForm.notes" id="return-notes" rows="3"
            placeholder="Ghi chú về tình trạng máy lúc thu hồi..."></textarea>
        </AppFormControl>
      </div>

      <template #footer>
        <AppButton label="Hủy" variant="ghost" @click="isReturnModalOpen = false" />
        <AppButton label="Xác nhận trả máy" variant="primary" :loading="returning" @click="handleReturn" />
      </template>
    </AppDialog>
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

.empty-state-desc {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  max-width: 400px;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.app-table tr:last-child td {
  border-bottom: none;
}

.app-table tr:hover {
  background: rgba(255, 255, 255, 0.01);
}

.text-success {
  color: #4ade80;
}

.text-warning {
  color: #fbbf24;
}

.action-btn-primary {
  padding: 6px 16px;
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.device-info,
.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
