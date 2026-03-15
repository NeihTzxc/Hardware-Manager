<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppDialog from '~/components/ui/AppDialog.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

interface Props {
  modelValue: boolean
  accessory: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'save'])

const api = useApi()
const { success, error: notifyError } = useNotification()

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const form = reactive({
  userId: '',
  quantity: 1,
  notes: ''
})

const users = ref<any[]>([])

async function fetchUsers() {
  try {
    const data = await api<{ success: boolean; users: any[] }>('/api/users')
    users.value = data.users
  } catch (err) {
    console.error('Fetch users error:', err)
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchUsers()
    resetForm()
  }
})

async function handleCheckout() {
  if (loading.value || !form.userId) return

  loading.value = true
  try {
    const data = await api<{ success: boolean; message: string }>(`/api/accessories/${props.accessory.id}/checkout`, {
      method: 'POST',
      body: form
    })

    if (data.success) {
      success('Thành công', data.message)
      emit('save')
      isVisible.value = false
      resetForm()
    }
  } catch (err: any) {
    const msg = err.data?.message || 'Có lỗi xảy ra khi cấp phát phụ kiện'
    notifyError('Lỗi', msg)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.userId = ''
  form.quantity = 1
  form.notes = ''
}
</script>

<template>
  <AppDialog v-model="isVisible" title="Cấp phát phụ kiện" size="md" @close="resetForm">
    <div class="checkout-info">
      <p>Phụ kiện: <strong>{{ accessory?.name }}</strong></p>
      <p>Khả dụng: <strong>{{ accessory?.availableQuantity ?? 0 }}</strong></p>
    </div>

    <div class="grid grid-cols-1 gap-4 mt-4">
      <AppFormControl label="Người nhận" id="checkout-user" required>
        <select v-model="form.userId" id="checkout-user">
          <option value="" disabled selected>Chọn người nhận...</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name || user.email }}
          </option>
        </select>
      </AppFormControl>

      <AppFormControl label="Số lượng" id="checkout-qty" required>
        <input v-model.number="form.quantity" id="checkout-qty" type="number" min="1" :max="accessory?.availableQuantity || 1" />
      </AppFormControl>

      <AppFormControl label="Ghi chú" id="checkout-notes">
        <textarea v-model="form.notes" id="checkout-notes" rows="2" placeholder="Ghi chú thêm..."></textarea>
      </AppFormControl>
    </div>

    <template #footer>
      <AppButton label="Hủy" variant="ghost" @click="isVisible = false" />
      <AppButton label="Cấp phát" variant="primary" :loading="loading" @click="handleCheckout" />
    </template>
  </AppDialog>
</template>

<style scoped>
.checkout-info {
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checkout-info strong {
  color: var(--color-text-primary);
}
</style>
