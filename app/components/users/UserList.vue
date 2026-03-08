<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UserModal from './UserModal.vue'
import AppConfirmDialog from '~/components/ui/AppConfirmDialog.vue'
import { useAuthStore } from '~/stores/auth'
import { useNotification } from '~/composables/useNotification'

const authStore = useAuthStore()
const notification = useNotification()

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'USER'
  createdAt: string
  updatedAt: string
}

const users = ref<User[]>([])
const loading = ref(true)

// Modal state
const isModalOpen = ref(false)
const selectedUser = ref<User | null>(null)

// Confirm Dialog state
const isConfirmOpen = ref(false)
const userToDelete = ref<User | null>(null)

async function fetchUsers() {
  loading.value = true
  try {
    const data = await $fetch<{ success: boolean; data: User[] }>('/api/users')
    if (data.success) {
      users.value = data.data
    }
  } catch (err) {
    console.error('Lỗi khi tải danh sách người dùng:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})

function openAddModal() {
  selectedUser.value = null
  isModalOpen.value = true
}

function openEditModal(user: User) {
  selectedUser.value = user
  isModalOpen.value = true
}

function confirmDelete(user: User) {
  userToDelete.value = user
  isConfirmOpen.value = true
}

function cancelDelete() {
  isConfirmOpen.value = false
  userToDelete.value = null
}

async function executeDelete() {
  if (!userToDelete.value) return
  const user = userToDelete.value

  try {
    const data = await $fetch(`/api/users/${user.id}`, { method: 'DELETE' })
    isConfirmOpen.value = false
    notification.success('Đã xóa', `Người dùng ${user.name || user.email} đã được xóa khỏi hệ thống.`)
    fetchUsers()
  } catch (err: any) {
    console.error('Lỗi khi xóa người dùng:', err)
    isConfirmOpen.value = false
    const msg = err.data?.message || 'Không thể xóa người dùng này.'
    notification.error('Thất bại', msg)
  }
}

function onModalClose() {
  isModalOpen.value = false
}

function onModalSuccess() {
  isModalOpen.value = false
  notification.success(
    selectedUser.value ? 'Cập nhật thành công' : 'Thêm mới thành công',
    selectedUser.value ? 'Đã lưu thay đổi cho người dùng.' : 'Đã tạo tài khoản cho người dùng mới.'
  )
  fetchUsers()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="user-list-container">
    <div class="header-actions">
      <h2 class="section-title">Danh sách Người dùng</h2>
      <button v-if="authStore.user?.role === 'ADMIN'" class="btn-primary" @click="openAddModal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14m-7-7h14" stroke-linecap="round" />
        </svg>
        Thêm người dùng
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải dữ liệu...</p>
    </div>

    <div v-else-if="users.length === 0" class="empty-state">
      <p>Không có người dùng nào trong hệ thống.</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Tên / Initials</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Ngày tạo</th>
            <th class="actions-col">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <div class="user-cell">
                <div class="avatar-sm">{{ (user.name || user.email).charAt(0).toUpperCase() }}</div>
                <span class="user-name-text">{{ user.name || '—' }}</span>
              </div>
            </td>
            <td><span class="text-secondary">{{ user.email }}</span></td>
            <td>
              <span class="role-badge" :class="user.role === 'ADMIN' ? 'role-admin' : 'role-user'">
                {{ user.role === 'ADMIN' ? 'Admin' : 'User' }}
              </span>
            </td>
            <td><span class="text-secondary">{{ formatDate(user.createdAt) }}</span></td>
            <td class="actions-cell">
              <button class="btn-icon" title="Chỉnh sửa" @click="openEditModal(user)"
                v-if="authStore.user?.role === 'ADMIN' || authStore.user?.id === user.id">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path
                    d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                    stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button class="btn-icon text-error" title="Xóa" @click="confirmDelete(user)"
                v-if="authStore.user?.role === 'ADMIN' && authStore.user?.id !== user.id">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                    stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <UserModal v-if="isModalOpen" :user="selectedUser" @close="onModalClose" @success="onModalSuccess" />

    <!-- Confirm Dialog -->
    <AppConfirmDialog v-if="isConfirmOpen" title="Xác nhận xóa"
      :message="`Bạn có chắc chắn muốn xóa người dùng ${userToDelete?.name || userToDelete?.email} không? Hành động này không thể hoàn tác.`"
      confirm-text="Xóa người dùng" cancel-text="Hủy" :is-destructive="true" @confirm="executeDelete"
      @cancel="cancelDelete" />
  </div>
</template>

<style scoped>
.user-list-container {
  display: flex;
  flex-direction: column;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--color-accent);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-primary:hover {
  background: var(--color-accent-hover);
}

.btn-primary svg {
  width: 16px;
  height: 16px;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-secondary);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: rgba(255, 255, 255, 0.03);
  padding: 12px 16px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover {
  background: var(--color-surface-hover);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xs);
  font-weight: 700;
}

.user-name-text {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.text-secondary {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.role-badge {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
}

.role-admin {
  background: rgba(168, 85, 247, 0.15);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.role-user {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.actions-col {
  width: 100px;
  text-align: right;
}

.actions-cell {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-xs);
}

.btn-icon {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-icon:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.btn-icon.text-error:hover {
  color: var(--color-error);
  background: rgba(239, 68, 68, 0.1);
}

.btn-icon svg {
  width: 16px;
  height: 16px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: var(--color-text-muted);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}
</style>
