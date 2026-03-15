<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AccessoryModal from '~/components/modals/AccessoryModal.vue'
import CheckoutAccessoryModal from '~/components/modals/CheckoutAccessoryModal.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const api = useApi()
const { success: notifySuccess, error: notifyError } = useNotification()

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isCheckoutModalOpen = ref(false)
const selectedAccessory = ref<any>(null)
const accessories = ref<any[]>([])
const loading = ref(false)

async function fetchAccessories() {
  loading.value = true
  try {
    const data = await api<{ success: boolean; accessories: any[] }>('/api/accessories')
    accessories.value = data.accessories
  } catch (err) {
    console.error('Fetch accessories error:', err)
  } finally {
    loading.value = false
  }
}

function onSave() {
  fetchAccessories()
}

function openEditModal(acc: any) {
  selectedAccessory.value = { ...acc }
  isEditModalOpen.value = true
}

function openCheckoutModal(acc: any) {
  selectedAccessory.value = { ...acc }
  isCheckoutModalOpen.value = true
}

async function handleDelete(acc: any) {
  if (!confirm(`Bạn có chắc chắn muốn xóa phụ kiện "${acc.name}"?`)) return

  try {
    const data = await api<{ success: boolean }>(`/api/accessories/${acc.id}`, {
      method: 'DELETE'
    })
    if (data.success) {
      notifySuccess('Thành công', 'Phụ kiện đã được xóa')
      fetchAccessories()
    }
  } catch (err: any) {
    notifyError('Lỗi', err.data?.message || 'Lỗi khi xóa phụ kiện')
  }
}

function closeModals() {
  isAddModalOpen.value = false
  isEditModalOpen.value = false
  isCheckoutModalOpen.value = false
  selectedAccessory.value = null
}

onMounted(() => {
  fetchAccessories()
})

function formatVND(value: number | null) {
  if (!value) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}
</script>

<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Quản lý phụ kiện</h1>
        <p class="page-subtitle">Quản lý chuột, bàn phím, cáp sạc và các phụ kiện văn phòng</p>
      </div>

      <AppButton label="Thêm phụ kiện" variant="primary" @click="isAddModalOpen = true" />
    </div>

    <div v-if="loading && accessories.length === 0" class="loading-container">
      <div class="spinner-simple"></div>
      <p>Đang tải danh sách phụ kiện...</p>
    </div>

    <div v-else-if="accessories.length > 0" class="table-container fade-in">
      <table class="app-table">
        <thead>
          <tr>
            <th>Tên phụ kiện</th>
            <th>Danh mục</th>
            <th>Hãng SX</th>
            <th class="text-center">Tổng SL</th>
            <th class="text-center">Khả dụng</th>
            <th class="text-center">Đã cấp</th>
            <th>Đơn giá</th>
            <th class="text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="acc in accessories" :key="acc.id">
            <td>
              <div class="item-info">
                <span class="item-name font-bold">{{ acc.name }}</span>
                <span class="item-id">{{ acc.id }}</span>
              </div>
            </td>
            <td>
              <span class="category-tag">{{ acc.category?.name }}</span>
            </td>
            <td>{{ acc.manufacturer || '—' }}</td>
            <td class="text-center">
              <span class="qty-badge">{{ acc.totalQuantity }}</span>
            </td>
            <td class="text-center">
              <span :class="['qty-badge', acc.availableQuantity <= (acc.minQuantity || 0) ? 'qty-low' : 'qty-ok']">
                {{ acc.availableQuantity }}
              </span>
            </td>
            <td class="text-center">
              <span class="qty-badge qty-out">{{ acc.checkedOutQuantity }}</span>
            </td>
            <td>{{ formatVND(acc.unitPrice) }}</td>
            <td>
              <div class="flex justify-end gap-2">
                <button v-if="acc.availableQuantity > 0" class="action-btn-accent" @click="openCheckoutModal(acc)">Cấp phát</button>
                <button class="action-btn" @click="openEditModal(acc)">Sửa</button>
                <button class="action-btn btn-delete" @click="handleDelete(acc)">Xóa</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </div>
      <h3 class="empty-state-title">Chưa có phụ kiện nào</h3>
      <p class="empty-state-desc">Hãy bắt đầu bằng cách thêm phụ kiện mới vào kho.</p>

      <div class="mt-6">
        <AppButton label="Thêm phụ kiện đầu tiên" variant="secondary" @click="isAddModalOpen = true" />
      </div>
    </div>

    <!-- Modals -->
    <AccessoryModal v-model="isAddModalOpen" @save="onSave" />
    <AccessoryModal v-model="isEditModalOpen" :accessory="selectedAccessory" @save="onSave"
      @update:model-value="val => !val && closeModals()" />
    <CheckoutAccessoryModal v-if="selectedAccessory" v-model="isCheckoutModalOpen" :accessory="selectedAccessory" @save="onSave"
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
.app-table tr:hover { background: rgba(255, 255, 255, 0.01); }

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

/* Quantity badges */
.qty-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
}
.qty-ok { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
.qty-low { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.qty-out { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }

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
