<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

import AppButton from '~/components/ui/AppButton.vue'
import PrintTemplateModal from '~/components/modals/PrintTemplateModal.vue'

const api = useApi()
const { success, error: notifyError } = useNotification()

const templates = ref<any[]>([])
const loading = ref(false)
const selectedTemplate = ref<any>(null)
const isModalOpen = ref(false)

async function fetchTemplates() {
  loading.value = true
  try {
    const data = await api<{ success: boolean; templates: any[] }>('/api/print-templates')
    templates.value = data.templates
  } catch (err: any) {
    console.error('Fetch print templates error:', err)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  selectedTemplate.value = null
  isModalOpen.value = true
}

function openEditModal(template: any) {
  selectedTemplate.value = template
  isModalOpen.value = true
}

async function handleDelete(template: any) {
  if (!confirm(`Bạn có chắc muốn xóa biểu mẫu "${template.name}"?`)) return
  
  try {
    const data = await api<{ success: boolean }>(`/api/print-templates/${template.id}`, {
      method: 'DELETE'
    })
    
    if (data.success) {
      success('Thành công', 'Đã xóa biểu mẫu in')
      fetchTemplates()
    }
  } catch (err: any) {
    const msg = err.data?.message || 'Có lỗi xảy ra khi xóa'
    notifyError('Lỗi', msg)
  }
}

function getTypeName(type: string) {
  return type === 'HANDOVER' ? 'Giao máy (Handover)' : 'Thu hồi (Return)'
}

function handleSaved() {
  fetchTemplates()
}

onMounted(() => {
  fetchTemplates()
})
</script>

<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Biểu mẫu In ấn</h1>
        <p class="page-subtitle">Quản lý các mẫu biên bản giao nhận thiết bị (in ra PDF)</p>
      </div>
      <AppButton label="Tạo biểu mẫu mới" variant="primary" icon="plus" @click="openCreateModal" />
    </div>

    <div v-if="loading && templates.length === 0" class="loading-container">
      <div class="spinner-simple"></div>
      <p>Đang tải danh sách biểu mẫu...</p>
    </div>

    <div v-else-if="templates.length > 0" class="grid-cards fade-in">
      <div v-for="template in templates" :key="template.id" class="template-card">
        <div class="card-header">
          <div class="card-title-row">
            <h3 class="template-name">{{ template.name }}</h3>
            <span v-if="template.isDefault" class="badge badge-success">Mặc định</span>
          </div>
          <div class="template-type" :class="template.type === 'HANDOVER' ? 'type-handover' : 'type-return'">
            {{ getTypeName(template.type) }}
          </div>
        </div>
        <div class="card-body">
          <p class="template-desc">{{ template.description || 'Không có mô tả.' }}</p>
        </div>
        <div class="card-footer">
          <span class="date-text">Cập nhật: {{ new Date(template.updatedAt).toLocaleDateString('vi-VN') }}</span>
          <div class="actions">
            <button class="icon-btn edit-btn" @click="openEditModal(template)" title="Chỉnh sửa">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button class="icon-btn delete-btn" @click="handleDelete(template)" title="Xoá">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
      </div>
      <h3 class="empty-state-title">Chưa có biểu mẫu in ấn nào</h3>
      <p class="empty-state-desc">Hãy tạo một biểu mẫu HTML tùy chỉnh để áp dụng lúc tạo biên bản cho nhân viên.</p>
      <AppButton label="Tạo biểu mẫu đầu tiên" variant="primary" class="mt-4" @click="openCreateModal" />
    </div>

    <!-- Edit Modal -->
    <PrintTemplateModal 
      v-model="isModalOpen" 
      :template="selectedTemplate" 
      @saved="handleSaved" 
    />
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

.mt-4 {
  margin-top: var(--spacing-lg);
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

/* Grid Cards */
.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.template-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: rgba(99, 102, 241, 0.3);
}

.card-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.card-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  gap: var(--spacing-sm);
}

.template-name {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
}

.badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.badge-success {
  background: rgba(74, 222, 128, 0.15);
  color: #22c55e;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.template-type {
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--radius-md);
  display: inline-block;
}

.type-handover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.type-return {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.card-body {
  padding: var(--spacing-lg);
  flex: 1;
}

.template-desc {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.card-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.01);
}

.date-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.actions {
  display: flex;
  gap: var(--spacing-sm);
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-secondary);
}

.icon-btn svg {
  width: 16px;
  height: 16px;
}

.icon-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
</style>
