<script setup lang="ts">
import { ref } from 'vue'

const confirmation = ref('')
const isSubmitting = ref(false)
const isDialogOpen = ref(false)
const notification = useNotification()

const confirmationText = 'XÓA TOÀN BỘ'
const canReset = computed(() => confirmation.value.trim() === confirmationText && !isSubmitting.value)

function openDialog() {
  confirmation.value = ''
  isDialogOpen.value = true
}

function closeDialog() {
  if (!isSubmitting.value) {
    isDialogOpen.value = false
  }
}

async function resetData() {
  if (!canReset.value) return

  isSubmitting.value = true
  try {
    const response = await $fetch<{ message: string; data: Record<string, number> }>('/api/settings/data-reset', {
      method: 'POST',
      body: { confirmation: confirmation.value }
    })

    isDialogOpen.value = false
    notification.success('Đã xóa dữ liệu', response.message)
  } catch (error: any) {
    notification.error('Không thể xóa dữ liệu', error?.data?.message || 'Vui lòng thử lại sau.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="danger-zone">
    <div class="danger-heading">
      <div>
        <h3>Vùng nguy hiểm</h3>
        <p>Xóa dữ liệu được tạo nhầm sau khi import hoặc làm mới kho dữ liệu phần cứng.</p>
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </svg>
    </div>

    <div class="danger-content">
      <div>
        <h4>Xóa toàn bộ dữ liệu phần cứng</h4>
        <p>
          Xóa thiết bị, danh mục, linh kiện, phụ kiện, nhà cung cấp, vị trí lưu trữ và lịch sử liên quan
          (bàn giao, bảo trì, xuất/nhập phụ kiện, cài đặt linh kiện và phiếu yêu cầu gắn với thiết bị).
          Tài khoản, cấu hình, phần mềm, domain/SSL và mẫu in không bị ảnh hưởng.
        </p>
      </div>
      <button type="button" class="reset-button" @click="openDialog">Xóa toàn bộ dữ liệu</button>
    </div>

    <Teleport to="body">
      <div v-if="isDialogOpen" class="modal-overlay" @click.self="closeDialog">
        <div class="reset-dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title">
          <div class="dialog-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
          </div>
          <h3 id="reset-title">Xác nhận xóa toàn bộ dữ liệu</h3>
          <p>Thao tác này không thể hoàn tác. Để tiếp tục, hãy nhập chính xác <strong>{{ confirmationText }}</strong>.</p>
          <input v-model="confirmation" class="confirmation-input" :disabled="isSubmitting" :placeholder="confirmationText" autocomplete="off" @keyup.enter="resetData" />
          <div class="dialog-actions">
            <button type="button" class="cancel-button" :disabled="isSubmitting" @click="closeDialog">Hủy</button>
            <button type="button" class="confirm-button" :disabled="!canReset" @click="resetData">
              {{ isSubmitting ? 'Đang xóa…' : 'Xóa vĩnh viễn' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.danger-zone { margin-top: var(--spacing-xl); border: 1px solid rgba(239, 68, 68, .55); border-radius: var(--radius-xl); overflow: hidden; }
.danger-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--spacing-md); padding: var(--spacing-lg) var(--spacing-xl); background: rgba(239, 68, 68, .08); border-bottom: 1px solid rgba(239, 68, 68, .3); }
.danger-heading h3, .danger-content h4 { margin: 0; color: var(--color-text-primary); font-weight: 700; }
.danger-heading p, .danger-content p { margin: var(--spacing-xs) 0 0; color: var(--color-text-secondary); font-size: var(--font-size-sm); line-height: 1.55; }
.danger-heading svg { flex: 0 0 auto; width: 24px; height: 24px; color: var(--color-error); }
.danger-content { display: flex; align-items: center; justify-content: space-between; gap: var(--spacing-xl); padding: var(--spacing-xl); }
.danger-content p { max-width: 650px; }
.reset-button, .confirm-button { border: 0; border-radius: var(--radius-md); padding: 10px 16px; color: #fff; background: var(--color-error); font: inherit; font-weight: 600; cursor: pointer; white-space: nowrap; }
.reset-button:hover, .confirm-button:not(:disabled):hover { background: #dc2626; }
.modal-overlay { position: fixed; inset: 0; z-index: var(--z-modal); display: grid; place-items: center; padding: var(--spacing-md); background: rgba(0, 0, 0, .65); backdrop-filter: blur(4px); }
.reset-dialog { width: min(100%, 480px); padding: var(--spacing-xl); border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-bg-card); box-shadow: var(--shadow-xl); }
.dialog-icon { display: grid; place-items: center; width: 44px; height: 44px; margin-bottom: var(--spacing-md); border-radius: 50%; color: var(--color-error); background: rgba(239, 68, 68, .12); }
.dialog-icon svg { width: 24px; height: 24px; }
.reset-dialog h3 { margin: 0; color: var(--color-text-primary); font-size: var(--font-size-lg); }
.reset-dialog p { margin: var(--spacing-sm) 0 var(--spacing-lg); color: var(--color-text-secondary); line-height: 1.55; }
.confirmation-input { box-sizing: border-box; width: 100%; padding: 11px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-md); outline: 0; color: var(--color-text-primary); background: var(--color-bg-secondary); font: inherit; }
.confirmation-input:focus { border-color: var(--color-error); box-shadow: 0 0 0 3px rgba(239, 68, 68, .14); }
.dialog-actions { display: flex; justify-content: flex-end; gap: var(--spacing-sm); margin-top: var(--spacing-lg); }
.cancel-button { padding: 10px 16px; border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); background: transparent; font: inherit; cursor: pointer; }
.cancel-button:hover { background: var(--color-surface-hover); }
.confirm-button:disabled, .cancel-button:disabled { opacity: .55; cursor: not-allowed; }
@media (max-width: 640px) { .danger-content { align-items: stretch; flex-direction: column; } .reset-button { width: 100%; } }
</style>
