<script setup lang="ts">
import Tabs from '~/components/ui/Tabs.vue'
import AppButton from '~/components/ui/AppButton.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const id = route.params.id as string

const accessory = ref<any>(null)
const loading = ref(true)
const activeTab = ref('checkouts')

const tabs = [
  { id: 'checkouts', label: 'Lịch sử cấp phát' }
]

async function fetchAccessory() {
  loading.value = true
  try {
    const data = await api<{ success: boolean; accessory: any }>(`/api/accessories/${id}`)
    accessory.value = data.accessory
  } catch (err) {
    console.error('Fetch accessory detail error:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string | null) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}

onMounted(() => {
  fetchAccessory()
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
            <NuxtLink to="/accessories">Phụ kiện</NuxtLink>
            <span class="separator">/</span>
            <span>Chi tiết</span>
          </div>
          <h1 class="acc-title" v-if="accessory">{{ accessory.name }}</h1>
          <div class="skeleton h-8 w-64" v-else></div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner-simple"></div>
      <p>Đang tải thông tin phụ kiện...</p>
    </div>

    <div v-else-if="accessory" class="detail-grid">
      <!-- Left Column -->
      <div class="main-column">
        <div class="info-card stats-card">
          <div class="stat-item">
            <span class="stat-label">Tổng số lượng</span>
            <span class="stat-value">{{ accessory.totalQuantity }}</span>
          </div>
          <div class="stat-item border-l border-r border-white/5">
            <span class="stat-label">Số lượng tối thiểu</span>
            <span class="stat-value text-accent">{{ accessory.minQuantity || '—' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Vị trí kho</span>
            <span class="stat-value">{{ accessory.location?.name || 'Chưa xác định' }}</span>
          </div>
        </div>

        <div class="info-card">
          <h2 class="card-title">Thông tin cơ bản</h2>
          <div class="details-grid">
            <div class="detail-item">
              <label>ID Phụ kiện</label>
              <span>{{ accessory.id }}</span>
            </div>
            <div class="detail-item">
              <label>Danh mục</label>
              <span class="category-tag">{{ accessory.category?.name }}</span>
            </div>
            <div class="detail-item">
              <label>Model / Hãng</label>
              <span>{{ accessory.model || '—' }} {{ accessory.manufacturer ? `/ ${accessory.manufacturer}` : '' }}</span>
            </div>
          </div>
        </div>

        <div class="info-card">
          <h2 class="card-title">Ghi chú</h2>
          <p class="text-sm italic text-secondary">{{ accessory.notes || 'Không có ghi chú.' }}</p>
        </div>
      </div>

      <!-- Right Column -->
      <div class="side-column">
        <div class="info-card">
          <Tabs v-model="activeTab" :tabs="tabs">
            <div v-if="activeTab === 'checkouts'" class="history-content">
              <div v-if="accessory.checkouts.length === 0" class="empty-history">
                Chưa có lịch sử cấp phát.
              </div>
              <div v-else class="timeline">
                <div v-for="checkout in accessory.checkouts" :key="checkout.id" class="timeline-item">
                  <div class="timeline-dot" :class="{ 'active': !checkout.returnedAt }"></div>
                  <div class="timeline-body">
                    <div class="flex justify-between items-start">
                      <span class="user-name">{{ checkout.user.name }}</span>
                      <span class="qty-badge">x{{ checkout.quantity }}</span>
                    </div>
                    <div class="timeline-dates">
                      <span>{{ formatDate(checkout.checkedOutAt) }}</span>
                      <span v-if="checkout.returnedAt"> → {{ formatDate(checkout.returnedAt) }}</span>
                      <span v-else class="current-tag ml-2">Đang giữ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container { max-width: 1200px; }
.detail-header { margin-bottom: var(--spacing-2xl); }
.back-btn {
  width: 40px; height: 40px; border-radius: 12px;
  background: var(--color-surface); border: 1px solid var(--color-border);
  color: var(--color-text-secondary); display: flex; align-items: center;
  justify-content: center; cursor: pointer; transition: all var(--transition-fast);
}
.back-btn:hover { background: var(--color-surface-hover); color: var(--color-text-primary); }
.breadcrumb { font-size: var(--font-size-xs); color: var(--color-text-muted); margin-bottom: 4px; display: flex; gap: 4px; }
.acc-title { font-size: var(--font-size-3xl); font-weight: 800; }

.detail-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: var(--spacing-xl); }
@media (max-width: 1024px) { .detail-grid { grid-template-columns: 1fr; } }

.info-card {
  background: var(--color-bg-card); border: 1px solid var(--color-border);
  border-radius: var(--radius-xl); padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl); box-shadow: var(--shadow-sm);
}
.card-title { font-size: var(--font-size-base); font-weight: 700; margin-bottom: var(--spacing-lg); color: var(--color-text-primary); }
.stats-card { display: flex; padding: 0; overflow: hidden; }
.stat-item { flex: 1; padding: var(--spacing-lg); display: flex; flex-direction: column; gap: 4px; }
.stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); }
.stat-value { font-size: var(--font-size-base); font-weight: 600; }
.text-accent { color: var(--color-accent); }

.details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-item label { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.detail-item span { font-size: var(--font-size-sm); font-weight: 500; }

.category-tag { background: var(--color-surface); padding: 2px 8px; border-radius: var(--radius-full); border: 1px solid var(--color-border); width: fit-content; }

.history-content { min-height: 200px; }
.empty-history { display: flex; align-items: center; justify-content: center; height: 200px; color: var(--color-text-muted); font-style: italic; }
.timeline { display: flex; flex-direction: column; gap: var(--spacing-lg); position: relative; padding-left: 20px; }
.timeline::before { content: ''; position: absolute; left: 4px; top: 8px; bottom: 8px; width: 1px; background: var(--color-border); }
.timeline-item { position: relative; }
.timeline-dot { position: absolute; left: -20px; top: 6px; width: 9px; height: 9px; border-radius: 50%; background: var(--color-border); border: 2px solid var(--color-bg-card); z-index: 1; }
.timeline-dot.active { background: var(--color-accent); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2); }
.user-name { font-size: var(--font-size-sm); font-weight: 700; color: var(--color-text-primary); }
.qty-badge { font-size: 10px; font-weight: 800; color: var(--color-accent); background: rgba(99, 102, 241, 0.1); padding: 2px 6px; border-radius: 4px; }
.timeline-dates { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.current-tag { background: rgba(99, 102, 241, 0.1); color: var(--color-accent); font-size: 10px; font-weight: 700; padding: 2px 4px; border-radius: 4px; text-transform: uppercase; }

.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px; gap: 16px; color: var(--color-text-muted); }
.spinner-simple { width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.1); border-top-color: var(--color-accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
</style>
