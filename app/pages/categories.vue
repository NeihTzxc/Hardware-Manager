<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import CategoryModal from '~/components/modals/CategoryModal.vue'

definePageMeta({ 
  layout: 'dashboard',
  middleware: 'auth'
})

const api = useApi()
const { success, error: notifyError } = useNotification()
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedCategory = ref<any>(null)
const categories = ref<any[]>([])
const loading = ref(false)

async function fetchCategories() {
  loading.value = true
  try {
    const data = await api<{ success: boolean; categories: any[] }>('/api/categories')
    categories.value = data.categories
  } catch (err) {
    console.error('Fetch categories error:', err)
  } finally {
    loading.value = false
  }
}

function onCategorySave() {
  fetchCategories()
}

async function deleteCategory(id: string) {
  if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return
  
  try {
    await api(`/api/categories/${id}`, { method: 'DELETE' })
    success('Thành công', 'Danh mục đã được xóa')
    fetchCategories()
  } catch (err: any) {
    const msg = err.data?.message || 'Không thể xóa danh mục'
    notifyError('Lỗi', msg)
  }
}

function openEditModal(category: any) {
  selectedCategory.value = { ...category }
  isEditModalOpen.value = true
}

function closeModals() {
  isAddModalOpen.value = false
  isEditModalOpen.value = false
  selectedCategory.value = null
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Quản lý danh mục</h1>
        <p class="page-subtitle">Phân loại và tổ chức các danh mục thiết bị</p>
      </div>

      <AppButton label="Thêm danh mục" variant="primary" @click="isAddModalOpen = true" />
    </div>

    <div v-if="loading && categories.length === 0" class="loading-container">
      <div class="spinner-simple"></div>
      <p>Đang tải danh sách danh mục...</p>
    </div>

    <div v-else-if="categories.length > 0" class="table-container fade-in">
      <table class="app-table">
        <thead>
          <tr>
            <th>Tên danh mục</th>
            <th>Mô tả</th>
            <th>Ngày tạo</th>
            <th class="text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat.id">
            <td>
              <div class="category-info">
                <span class="category-name font-bold">{{ cat.name }}</span>
                <span class="category-id">{{ cat.id }}</span>
              </div>
            </td>
            <td>
              <span class="text-muted">{{ cat.description || '—' }}</span>
            </td>
            <td>
              <span class="text-xs text-muted">{{ new Date(cat.createdAt).toLocaleDateString('vi-VN') }}</span>
            </td>
            <td>
              <div class="flex justify-end gap-2">
                <button class="action-btn" @click="openEditModal(cat)">Sửa</button>
                <button class="action-btn btn-delete" @click="deleteCategory(cat.id)">Xóa</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </svg>
      </div>
      <h3 class="empty-state-title">Chưa có danh mục nào</h3>
      <p class="empty-state-desc">Hãy bắt đầu bằng cách thêm danh mục mới vào hệ thống.</p>

      <div class="mt-6">
        <AppButton label="Thêm danh mục đầu tiên" variant="secondary" @click="isAddModalOpen = true" />
      </div>
    </div>

    <!-- Modals -->
    <CategoryModal v-model="isAddModalOpen" @save="onCategorySave" />
    <CategoryModal 
      v-model="isEditModalOpen" 
      :category="selectedCategory" 
      @save="onCategorySave" 
      @update:model-value="val => !val && closeModals()" 
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
  to { transform: rotate(360deg); }
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

/* Category Info */
.category-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.category-id {
  font-size: 10px;
  color: var(--color-text-muted);
  font-family: monospace;
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

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.4);
}
</style>
