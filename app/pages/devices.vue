<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import DeviceModal from '~/components/modals/DeviceModal.vue'
import BorrowModal from '~/components/modals/BorrowModal.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const api = useApi()
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isBorrowModalOpen = ref(false)
const selectedDevice = ref<any>(null)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const devices = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(false)

const statusOptions = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Sẵn sàng', value: 'AVAILABLE' },
  { label: 'Đang sử dụng', value: 'IN_USE' },
  { label: 'Bảo trì', value: 'MAINTENANCE' },
  { label: 'Ngừng sử dụng', value: 'RETIRED' },
  { label: 'Mất', value: 'LOST' }
]

async function fetchCategories() {
  try {
    const data = await api<{ success: boolean; data: any[] }>('/api/categories/list', {
      params: { type: 'DEVICE' }
    })
    categories.value = data.data
  } catch (err) {
    console.error('Fetch categories error:', err)
  }
}

async function fetchDevices() {
  loading.value = true
  try {
    const data = await api<{ success: boolean; devices: any[] }>('/api/devices', {
      params: { 
        q: searchQuery.value,
        categoryId: selectedCategory.value || undefined,
        status: selectedStatus.value || undefined
      }
    })
    devices.value = data.devices
  } catch (err) {
    console.error('Fetch devices error:', err)
  } finally {
    loading.value = false
  }
}

// Debounced search
let searchTimeout: NodeJS.Timeout
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchDevices()
  }, 400)
})

// Immediate fetch on filter change
watch([selectedCategory, selectedStatus], () => {
  fetchDevices()
})

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
}

function onDeviceSave() {
  fetchDevices()
}

function openEditModal(device: any) {
  selectedDevice.value = { ...device }
  isEditModalOpen.value = true
}

function openBorrowModal(device: any) {
  selectedDevice.value = { ...device }
  isBorrowModalOpen.value = true
}

function closeModals() {
  isAddModalOpen.value = false
  isEditModalOpen.value = false
  isBorrowModalOpen.value = false
  selectedDevice.value = null
}

onMounted(() => {
  fetchDevices()
  fetchCategories()
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
const isFiltered = computed(() => {
  return searchQuery.value || selectedCategory.value || selectedStatus.value
})
</script>

<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Quản lý thiết bị</h1>
        <p class="page-subtitle">Theo dõi và quản lý tất cả thiết bị trong công ty</p>
      </div>

      <div class="header-actions">
        <div class="filter-group">
          <select v-model="selectedCategory" class="custom-select">
            <option value="">Tất cả danh mục</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>

          <select v-model="selectedStatus" class="custom-select">
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input v-model="searchQuery" type="text" placeholder="Tìm kiếm..." class="search-input" />
        </div>
        <AppButton label="Thêm thiết bị" variant="primary" @click="isAddModalOpen = true" />
      </div>
    </div>

    <div v-if="loading && devices.length === 0" class="loading-container">
      <div class="spinner-simple"></div>
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
                <button v-if="device.status === 'AVAILABLE'" class="action-btn-accent" @click="openBorrowModal(device)">Mượn</button>
                <button class="action-btn" @click="openEditModal(device)">Sửa</button>
                <button class="action-btn btn-delete">Xóa</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">
        <svg v-if="isFiltered" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="8" x2="14" y2="14" />
          <line x1="14" y1="8" x2="8" y2="14" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
          stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      </div>
      <h3 class="empty-state-title">{{ isFiltered ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có thiết bị nào' }}</h3>
      <p class="empty-state-desc">{{ isFiltered ? 'Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.' : 'Hãy bắt đầu bằng cách thêm thiết bị mới vào hệ thống.' }}</p>

      <div class="mt-6">
        <AppButton v-if="!isFiltered" label="Thêm thiết bị đầu tiên" variant="secondary"
          @click="isAddModalOpen = true" />
        <AppButton v-else label="Xóa lọc" variant="ghost" @click="clearFilters" />
      </div>
    </div>

    <!-- Modals -->
    <DeviceModal v-model="isAddModalOpen" @save="onDeviceSave" />
    <DeviceModal v-model="isEditModalOpen" :device="selectedDevice" @save="onDeviceSave"
      @update:model-value="val => !val && closeModals()" />
    <BorrowModal v-model="isBorrowModalOpen" :device="selectedDevice" @save="onDeviceSave"
      @update:model-value="val => !val && closeModals()" />
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

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 8px 12px 8px 36px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  width: 280px;
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

.spinner-simple {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.1);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
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

.action-btn-accent {
  padding: 6px 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-accent);
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-accent);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn-accent:hover {
  background: var(--color-accent);
  color: white;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.4);
}
</style>
