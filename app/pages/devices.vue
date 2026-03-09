<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import DeviceModal from '~/components/modals/DeviceModal.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const api = useApi()
const isAddModalOpen = ref(false)
const devices = ref<any[]>([])
const loading = ref(false)

async function fetchDevices() {
  loading.value = true
  try {
    const data = await api<{ success: boolean; devices: any[] }>('/api/devices')
    devices.value = data.devices
  } catch (err) {
    console.error('Fetch devices error:', err)
  } finally {
    loading.value = false
  }
}

function onDeviceSave() {
  fetchDevices()
}

onMounted(() => {
  fetchDevices()
})

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
</script>

<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Quản lý thiết bị</h1>
        <p class="page-subtitle">Theo dõi và quản lý tất cả thiết bị trong công ty</p>
      </div>

      <AppButton label="Thêm thiết bị" variant="primary" icon="pi pi-plus" @click="isAddModalOpen = true" />
    </div>

    <div v-if="loading && devices.length === 0" class="loading-container">
      <i class="pi pi-spin pi-spinner text-4xl text-accent"></i>
      <p>Đang tải danh sách thiết bị...</p>
    </div>

    <div v-else-if="devices.length > 0" class="table-container fade-in">
      <table class="app-table">
        <thead>
          <tr>
            <th>Tên thiết bị</th>
            <th>Số Serial</th>
            <th>Danh mục</th>
            <th>Model / Hãng</th>
            <th>Trạng thái</th>
            <th class="text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="device in devices" :key="device.id">
            <td>
              <div class="device-info">
                <span class="device-name font-bold">{{ device.name }}</span>
                <span class="device-id">{{ device.id }}</span>
              </div>
            </td>
            <td>{{ device.serialNumber }}</td>
            <td>
              <span class="category-tag">{{ device.category?.name }}</span>
            </td>
            <td>
              <div class="model-info">
                <span>{{ device.model || '—' }}</span>
                <span class="text-muted text-xs">{{ device.manufacturer || '—' }}</span>
              </div>
            </td>
            <td>
              <span :class="['status-badge', `status-${device.status.toLowerCase()}`]">
                {{ getStatusLabel(device.status) }}
              </span>
            </td>
            <td>
              <div class="flex justify-end gap-2">
                <button class="action-btn" title="Cập nhật">
                  <i class="pi pi-pencil"></i>
                </button>
                <button class="action-btn btn-delete" title="Xóa">
                  <i class="pi pi-trash"></i>
                </button>
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
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      </div>
      <h3 class="empty-state-title">Chưa có thiết bị nào</h3>
      <p class="empty-state-desc">Hãy bắt đầu bằng cách thêm thiết bị mới vào hệ thống.</p>

      <div class="mt-6">
        <AppButton label="Thêm thiết bị đầu tiên" variant="secondary" icon="pi pi-plus" @click="isAddModalOpen = true" />
      </div>
    </div>

    <!-- Modal Thêm thiết bị -->
    <DeviceModal v-model="isAddModalOpen" @save="onDeviceSave" />
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
  font-size: var(--font-size-base);
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

.text-accent { color: var(--color-accent); }
.text-4xl { font-size: 2.5rem; }

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

/* Device Info Cell */
.device-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.device-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.device-id {
  font-size: 10px;
  color: var(--color-text-muted);
  font-family: monospace;
}

/* Category Tag */
.category-tag {
  background: var(--color-surface);
  color: var(--color-text-primary);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
  border: 1px solid var(--color-border);
}

/* Model Info */
.model-info {
  display: flex;
  flex-direction: column;
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

.status-available {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}

.status-in_use {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

.status-maintenance {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
}

.status-retired {
  background: rgba(107, 114, 128, 0.1);
  color: #9ca3af;
}

/* Action Buttons */
.action-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
  border-color: var(--color-text-muted);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.2);
}
</style>
