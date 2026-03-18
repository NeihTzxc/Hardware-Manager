<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import ComponentModal from '~/components/modals/ComponentModal.vue'
import InstallComponentModal from '~/components/modals/InstallComponentModal.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const router = useRouter()
const api = useApi()
const { success: notifySuccess, error: notifyError } = useNotification()

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isInstallModalOpen = ref(false)
const selectedComponent = ref<any>(null)
const components = ref<any[]>([])
const loading = ref(false)

async function fetchComponents() {
  loading.value = true
  try {
    const data = await api<{ success: boolean; components: any[] }>('/api/components')
    components.value = data.components
  } catch (err) {
    console.error('Fetch components error:', err)
  } finally {
    loading.value = false
  }
}

function onSave() {
  fetchComponents()
}

function openEditModal(comp: any) {
  selectedComponent.value = { ...comp }
  isEditModalOpen.value = true
}

function openInstallModal(comp: any) {
  selectedComponent.value = { ...comp }
  isInstallModalOpen.value = true
}

async function handleUninstall(comp: any) {
  try {
    const data = await api<{ success: boolean; message: string }>(`/api/components/${comp.id}/uninstall`, {
      method: 'POST'
    })
    if (data.success) {
      notifySuccess('Thành công', data.message)
      fetchComponents()
    }
  } catch (err: any) {
    notifyError('Lỗi', err.data?.message || 'Lỗi khi tháo linh kiện')
  }
}

async function handleDelete(comp: any) {
  if (!confirm(`Bạn có chắc chắn muốn xóa linh kiện "${comp.name}"?`)) return

  try {
    const data = await api<{ success: boolean }>(`/api/components/${comp.id}`, {
      method: 'DELETE'
    })
    if (data.success) {
      notifySuccess('Thành công', 'Linh kiện đã được xóa')
      fetchComponents()
    }
  } catch (err: any) {
    notifyError('Lỗi', err.data?.message || 'Lỗi khi xóa linh kiện')
  }
}

function goToDetail(id: string) {
  router.push(`/components/${id}`)
}

function closeModals() {
  isAddModalOpen.value = false
  isEditModalOpen.value = false
  isInstallModalOpen.value = false
  selectedComponent.value = null
}

onMounted(() => {
  fetchComponents()
})

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    AVAILABLE: 'Sẵn sàng',
    INSTALLED: 'Đã lắp đặt',
    DEFECTIVE: 'Hỏng',
    DISPOSED: 'Đã thanh lý'
  }
  return labels[status] || status
}
</script>

<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Quản lý linh kiện</h1>
        <p class="page-subtitle">Theo dõi RAM, ổ cứng, card và các linh kiện phần cứng</p>
      </div>

      <AppButton label="Thêm linh kiện" variant="primary" @click="isAddModalOpen = true" />
    </div>

    <div v-if="loading && components.length === 0" class="loading-container">
      <div class="spinner-simple"></div>
      <p>Đang tải danh sách linh kiện...</p>
    </div>

    <div v-else-if="components.length > 0" class="table-container fade-in">
      <table class="app-table">
        <thead>
          <tr>
            <th>Tên linh kiện</th>
            <th>Số Serial</th>
            <th>Danh mục</th>
            <th>Hãng SX</th>
            <th>Trạng thái</th>
            <th>Thiết bị mẹ</th>
            <th class="text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comp in components" :key="comp.id" @click="goToDetail(comp.id)" class="clickable-row">
            <td>
              <div class="item-info">
                <span class="item-name font-bold">{{ comp.name }}</span>
                <span class="item-id">{{ comp.id }}</span>
              </div>
            </td>
            <td>{{ comp.serialNumber || '—' }}</td>
            <td>
              <span class="category-tag">{{ comp.category?.name }}</span>
            </td>
            <td>{{ comp.manufacturer || '—' }}</td>
            <td>
              <span :class="['status-badge', `status-${comp.status.toLowerCase()}`]">
                {{ getStatusLabel(comp.status) }}
              </span>
            </td>
            <td>
              <span v-if="comp.device" class="device-link">
                {{ comp.device.name }}
              </span>
              <span v-else class="text-muted">—</span>
            </td>
            <td>
              <div class="flex justify-end gap-2">
                <button v-if="comp.status === 'AVAILABLE'" class="action-btn-accent" @click.stop="openInstallModal(comp)">Lắp đặt</button>
                <button v-if="comp.status === 'INSTALLED'" class="action-btn-accent" @click.stop="handleUninstall(comp)">Tháo ra</button>
                <button class="action-btn" @click.stop="openEditModal(comp)">Sửa</button>
                <button class="action-btn btn-delete" @click.stop="handleDelete(comp)">Xóa</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6M9 13h6M9 17h4" />
        </svg>
      </div>
      <h3 class="empty-state-title">Chưa có linh kiện nào</h3>
      <p class="empty-state-desc">Hãy bắt đầu bằng cách thêm linh kiện mới vào kho.</p>

      <div class="mt-6">
        <AppButton label="Thêm linh kiện đầu tiên" variant="secondary" @click="isAddModalOpen = true" />
      </div>
    </div>

    <!-- Modals -->
    <ComponentModal v-model="isAddModalOpen" @save="onSave" />
    <ComponentModal v-model="isEditModalOpen" :component="selectedComponent" @save="onSave"
      @update:model-value="val => !val && closeModals()" />
    <InstallComponentModal v-if="selectedComponent" v-model="isInstallModalOpen" :component="selectedComponent" @save="onSave"
      @update:model-value="val => !val && closeModals()" />
  </div>
</template>

<style scoped>
.page-container { max-width: 1200px; }

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
.empty-state-icon { width: 64px; height: 64px; color: var(--color-text-muted); margin-bottom: var(--spacing-lg); opacity: 0.5; }
.empty-state-icon svg { width: 100%; height: 100%; }
.empty-state-title { font-size: var(--font-size-xl); font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--spacing-sm); }
.empty-state-desc { color: var(--color-text-muted); font-size: var(--font-size-base); max-width: 400px; }

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
  width: 40px; height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.1);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.table-container {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.app-table { width: 100%; border-collapse: collapse; text-align: left; }
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
.app-table td { padding: 16px 20px; border-bottom: 1px solid var(--color-border); vertical-align: middle; }
.app-table tr:last-child td { border-bottom: none; }
.app-table tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.clickable-row {
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.item-info { display: flex; flex-direction: column; gap: 2px; }
.item-name { color: var(--color-text-primary); font-size: var(--font-size-sm); font-weight: 600; }
.item-id { font-size: 10px; color: var(--color-text-muted); font-family: monospace; }

.category-tag {
  background: var(--color-surface);
  color: var(--color-text-primary);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
  border: 1px solid var(--color-border);
}

.device-link {
  color: var(--color-accent);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}
.status-available { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
.status-installed { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
.status-defective { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }
.status-disposed { background: rgba(107, 114, 128, 0.1); color: #9ca3af; }

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
.action-btn:hover { background: var(--color-surface-hover); color: var(--color-text-primary); border-color: var(--color-text-muted); }

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
.action-btn-accent:hover { background: var(--color-accent); color: white; }

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.4);
}
</style>
