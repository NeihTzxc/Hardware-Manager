<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{
  user: any | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const authStore = useAuthStore()

const isEdit = !!props.user
const loading = ref(false)
const errorMsg = ref('')

const form = ref({
  email: '',
  password: '',
  name: '',
  role: 'USER'
})

onMounted(() => {
  if (isEdit && props.user) {
    form.value.email = props.user.email
    form.value.name = props.user.name || ''
    form.value.role = props.user.role
    // password stays empty on edit unless user wants to change it
  }
})

async function submitForm() {
  errorMsg.value = ''
  loading.value = true
  
  try {
    const url = isEdit ? `/api/users/${props.user.id}` : '/api/users'
    const method = isEdit ? 'PUT' : 'POST'
    
    // Only send password if it's new user or populated on edit
    const body: any = {
      email: form.value.email,
      name: form.value.name,
      role: form.value.role
    }
    
    if (form.value.password) {
      body.password = form.value.password
    }
    
    await $fetch(url, {
      method,
      body
    })
    
    emit('success')
  } catch (err: any) {
    errorMsg.value = err.data?.message || 'Có lỗi xảy ra. Hãy thử lại.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="modal-overlay fade-in" @click.self="emit('close')">
    <div class="modal-content slide-in-top">
      <div class="modal-header">
        <h3 class="modal-title">{{ isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới' }}</h3>
        <button class="close-btn" @click="emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
        </button>
      </div>
      
      <form @submit.prevent="submitForm" class="modal-form">
        <div v-if="errorMsg" class="error-alert">
          {{ errorMsg }}
        </div>
        
        <div class="form-group">
          <label>Email <span class="required">*</span></label>
          <input v-model="form.email" type="email" required placeholder="admin@hardware.com" class="form-input" />
        </div>
        
        <div class="form-group">
          <label>Mật khẩu <span v-if="!isEdit" class="required">*</span></label>
          <input 
            v-model="form.password" 
            type="password" 
            :required="!isEdit" 
            :placeholder="isEdit ? 'Bỏ trống nếu không đổi mật khẩu' : 'Mật khẩu người dùng'" 
            class="form-input" 
          />
        </div>
        
        <div class="form-group">
          <label>Tên hiển thị</label>
          <input v-model="form.name" type="text" placeholder="Nguyễn Văn A" class="form-input" />
        </div>
        
        <div v-if="authStore.user?.role === 'ADMIN'" class="form-group">
          <label>Vai trò</label>
          <select v-model="form.role" class="form-input">
            <option value="USER">User (Người dùng)</option>
            <option value="ADMIN">Admin (Quản trị viên)</option>
          </select>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn-cancel" @click="emit('close')">Hủy</button>
          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="loading" class="spinner-sm"></span>
            {{ isEdit ? 'Lưu thay đổi' : 'Thêm người dùng' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.modal-content {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 480px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

@keyframes slideInTop {
  from { opacity: 0; transform: translateY(-30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.slide-in-top {
  animation: slideInTop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
}

.close-btn {
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

.close-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-form {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.error-alert {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: var(--font-size-sm);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.required {
  color: var(--color-error);
}

.form-input {
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-cancel:hover {
  background: var(--color-surface-hover);
}

.btn-submit {
  display: flex;
  align-items: center;
  gap: 8px;
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

.btn-submit:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
</style>
