<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppDialog from '~/components/ui/AppDialog.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

interface Props {
  modelValue: boolean
  device?: any
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
const users = ref<any[]>([])
const form = reactive({
  userId: '',
  deviceId: '',
  conditionBefore: 'GOOD',
  notes: ''
})

const conditions = [
  { value: 'NEW', label: 'Mới' },
  { value: 'GOOD', label: 'Tốt' },
  { value: 'FAIR', label: 'Trung bình' },
  { value: 'POOR', label: 'Kém' },
  { value: 'DAMAGED', label: 'Hỏng' }
]

async function fetchUsers() {
  try {
    const res = await api<{ success: boolean; data: any[] }>('/api/users')
    users.value = res.data
  } catch (err) {
    console.error('Fetch users error:', err)
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchUsers()
    if (props.device) {
      form.deviceId = props.device.id
      form.conditionBefore = props.device.condition || 'GOOD'
    }
  }
})

async function handleBorrow() {
  if (!form.userId || !form.deviceId) return

  loading.value = true
  try {
    const data = await api<{ success: boolean }>('/api/assignments', {
      method: 'POST',
      body: form
    })

    if (data.success) {
      success('Thành công', 'Thiết bị đã được cấp phát thành công')
      emit('save')
      isVisible.value = false
      resetForm()
    }
  } catch (err: any) {
    const msg = err.data?.message || 'Có lỗi xảy ra khi thực hiện mượn thiết bị'
    notifyError('Lỗi', msg)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.userId = ''
  form.notes = ''
}
</script>

<template>
  <AppDialog v-model="isVisible" title="Mượn thiết bị" size="md" @close="resetForm">
    <div class="space-y-4">
      <div v-if="device" class="device-preview p-3 bg-surface rounded-lg border border-border flex items-center gap-3">
        <div class="p-2 bg-accent/10 rounded">
          <svg class="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        </div>
        <div>
          <div class="font-bold text-sm">{{ device.name }}</div>
          <div class="text-xs text-muted">{{ device.serialNumber }} • {{ device.model }}</div>
        </div>
      </div>

      <AppFormControl label="Người nhận thiết bị" id="user" required>
        <select v-model="form.userId" id="user">
          <option value="" disabled selected>Chọn người nhận...</option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name || user.email }}
          </option>
        </select>
      </AppFormControl>

      <AppFormControl label="Tình trạng lúc mượn" id="condition">
        <select v-model="form.conditionBefore" id="condition">
          <option v-for="c in conditions" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
      </AppFormControl>

      <AppFormControl label="Ghi chú mượn" id="notes">
        <textarea v-model="form.notes" id="notes" rows="3"
          placeholder="Ghi chú thêm (lý do mượn, phụ kiện đi kèm...)"></textarea>
      </AppFormControl>
    </div>

    <template #footer>
      <AppButton label="Hủy" variant="ghost" @click="isVisible = false" />
      <AppButton label="Xác nhận mượn" variant="primary" :loading="loading" @click="handleBorrow" />
    </template>
  </AppDialog>
</template>

<style scoped>
.device-preview {
  margin-bottom: var(--spacing-md);
}
</style>
