<script setup lang="ts">
import Tabs from '~/components/ui/Tabs.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const id = route.params.id as string

const category = ref<any>(null)
const loading = ref(true)
const activeTab = ref('devices')

const tabs = computed(() => {
  const t = []
  if (category.value?.type === 'DEVICE') {
    t.push({ id: 'devices', label: 'Danh sách thiết bị' })
  } else if (category.value?.type === 'COMPONENT') {
    t.push({ id: 'components', label: 'Danh sách linh kiện' })
  } else if (category.value?.type === 'ACCESSORY') {
    t.push({ id: 'accessories', label: 'Danh sách phụ kiện' })
  }
  return t
})

async function fetchCategory() {
  loading.value = true
  try {
    const data = await api<{ success: boolean; category: any }>(`/api/categories/${id}`)
    category.value = data.category
    
    // Set default tab based on type
    if (category.value.type === 'DEVICE') activeTab.value = 'devices'
    else if (category.value.type === 'COMPONENT') activeTab.value = 'components'
    else if (category.value.type === 'ACCESSORY') activeTab.value = 'accessories'
  } catch (err) {
    console.error('Fetch category detail error:', err)
  } finally {
    loading.value = false
  }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    AVAILABLE: 'Sẵn sàng',
    IN_USE: 'Đang sử dụng',
    MAINTENANCE: 'Bảo trì',
    RETIRED: 'Ngừng sử dụng',
    LOST: 'Mất',
    INSTALLED: 'Đã lắp đặt',
    DEFECTIVE: 'Lỗi',
    DISPOSED: 'Đã thanh lý'
  }
  return labels[status] || status
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN')
}

onMounted(() => {
  fetchCategory()
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
            <NuxtLink to="/categories">Danh mục</NuxtLink>
            <span class="separator">/</span>
            <span>Chi tiết</span>
          </div>
          <h1 class="category-title" v-if="category">{{ category.name }}</h1>
          <div class="skeleton h-8 w-64" v-else></div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner-simple"></div>
      <p>Đang tải thông tin danh mục...</p>
    </div>

    <div v-else-if="category" class="detail-grid single-column">
      <div class="info-card">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="card-title">Thông tin danh mục</h2>
            <p class="text-sm text-secondary mt-1">{{ category.description || 'Không có mô tả.' }}</p>
          </div>
          <div class="type-badge">{{ category.type }}</div>
        </div>

        <div class="details-grid">
          <div class="detail-item">
            <label>ID Danh mục</label>
            <span>{{ category.id }}</span>
          </div>
          <div class="detail-item">
            <label>Ngày tạo</label>
            <span>{{ formatDate(category.createdAt) }}</span>
          </div>
          <div class="detail-item">
            <label>Tổng số mục</label>
            <span>
              <template v-if="category.type === 'DEVICE'">{{ category.devices.length }} thiết bị</template>
              <template v-else-if="category.type === 'COMPONENT'">{{ category.components.length }} linh kiện</template>
              <template v-else-if="category.type === 'ACCESSORY'">{{ category.accessories.length }} loại phụ kiện</template>
            </span>
          </div>
        </div>
      </div>

      <div class="info-card">
        <Tabs v-model="activeTab" :tabs="tabs">
          <!-- Devices List -->
          <div v-if="activeTab === 'devices'" class="tab-pane">
            <table class="simple-table" v-if="category.devices.length > 0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên thiết bị</th>
                  <th>Số Serial</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="dev in category.devices" :key="dev.id" @click="router.push(`/devices/${dev.id}`)" class="clickable">
                  <td>{{ dev.id }}</td>
                  <td class="font-bold">{{ dev.name }}</td>
                  <td>{{ dev.serialNumber }}</td>
                  <td>
                    <span :class="['status-badge status-sm', `status-${dev.status.toLowerCase()}`]">
                      {{ getStatusLabel(dev.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-tab">Chưa có thiết bị nào trong danh mục này.</div>
          </div>

          <!-- Components List -->
          <div v-if="activeTab === 'components'" class="tab-pane">
            <table class="simple-table" v-if="category.components.length > 0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên linh kiện</th>
                  <th>Số Serial</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="comp in category.components" :key="comp.id" @click="router.push(`/components/${comp.id}`)" class="clickable">
                  <td>{{ comp.id }}</td>
                  <td class="font-bold">{{ comp.name }}</td>
                  <td>{{ comp.serialNumber || '—' }}</td>
                  <td>
                    <span :class="['status-badge status-sm', `status-${comp.status.toLowerCase()}`]">
                      {{ getStatusLabel(comp.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-tab">Chưa có linh kiện nào trong danh mục này.</div>
          </div>

          <!-- Accessories List -->
          <div v-if="activeTab === 'accessories'" class="tab-pane">
            <table class="simple-table" v-if="category.accessories.length > 0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên phụ kiện</th>
                  <th>Số lượng tồn</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="acc in category.accessories" :key="acc.id" @click="router.push(`/accessories/${acc.id}`)" class="clickable">
                  <td>{{ acc.id }}</td>
                  <td class="font-bold">{{ acc.name }}</td>
                  <td>{{ acc.totalQuantity }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-tab">Chưa có phụ kiện nào trong danh mục này.</div>
          </div>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container { max-width: 1000px; }
.detail-header { margin-bottom: var(--spacing-2xl); }
.back-btn {
  width: 40px; height: 40px; border-radius: 12px;
  background: var(--color-surface); border: 1px solid var(--color-border);
  color: var(--color-text-secondary); display: flex; align-items: center;
  justify-content: center; cursor: pointer; transition: all var(--transition-fast);
}
.back-btn:hover { background: var(--color-surface-hover); color: var(--color-text-primary); }
.breadcrumb { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-bottom: 4px; display: flex; gap: 4px; }
.category-title { font-size: var(--font-size-3xl); font-weight: 800; }
.info-card {
  background: var(--color-bg-card); border: 1px solid var(--color-border);
  border-radius: var(--radius-xl); padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl); box-shadow: var(--shadow-sm);
}
.card-title { font-size: var(--font-size-base); font-weight: 700; color: var(--color-text-primary); }
.type-badge {
  background: rgba(99, 102, 241, 0.1); color: var(--color-accent);
  padding: 4px 12px; border-radius: var(--radius-full);
  font-size: 10px; font-weight: 800; text-transform: uppercase;
}
.details-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--spacing-lg); }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-item label { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.detail-item span { font-size: var(--font-size-sm); font-weight: 600; }

.simple-table { width: 100%; border-collapse: collapse; margin-top: var(--spacing-md); }
.simple-table th {
  text-align: left; padding: 12px; font-size: 11px;
  text-transform: uppercase; color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
}
.simple-table td { padding: 12px; font-size: var(--font-size-sm); border-bottom: 1px solid var(--color-border); }
.simple-table tr.clickable { cursor: pointer; transition: background 0.2s; }
.simple-table tr.clickable:hover { background: rgba(255, 255, 255, 0.05); }

.status-badge { display: inline-flex; padding: 2px 8px; border-radius: var(--radius-full); font-size: 10px; font-weight: 700; }
.status-sm { font-size: 10px; }
.status-available { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
.status-in_use { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
.status-installed { background: rgba(139, 92, 246, 0.1); color: #a78bfa; }
.status-defective { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }

.empty-tab { padding: 40px; text-align: center; color: var(--color-text-muted); font-style: italic; }
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px; gap: 16px; color: var(--color-text-muted); }
.spinner-simple { width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.1); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
</style>
