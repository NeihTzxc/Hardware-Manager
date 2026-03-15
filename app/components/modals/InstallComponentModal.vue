<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppDialog from '~/components/ui/AppDialog.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

interface Props {
  modelValue: boolean
  component: any
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
  deviceId: '',
  notes: ''
})

const devices = ref<any[]>([])

async function fetchDevices() {
  try {
    const data = await api<{ success: boolean; devices: any[] }>('/api/devices')
    devices.value = data.devices
  } catch (err) {
    console.error('Fetch devices error:', err)
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchDevices()
    resetForm()
  }
})

async function handleInstall() {
  if (loading.value || !form.deviceId) return

  loading.value = true
  try {
    const data = await api<{ success: boolean; message: string }>(`/api/components/${props.component.id}/install`, {
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
    const msg = err.data?.message || 'Có lỗi xảy ra khi lắp linh kiện'
    notifyError('Lỗi', msg)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.deviceId = ''
  form.notes = ''
}
</script>

<template>
  <AppDialog v-model="isVisible" title="Lắp linh kiện vào thiết bị" size="md" @close="resetForm">
    <div class="install-info">
      <p>Linh kiện: <strong>{{ component?.name }}</strong></p>
    </div>

    <div class="grid grid-cols-1 gap-4 mt-4">
      <AppFormControl label="Chọn thiết bị" id="install-device" required>
        <select v-model="form.deviceId" id="install-device">
          <option value="" disabled selected>Chọn thiết bị...</option>
          <option v-for="dev in devices" :key="dev.id" :value="dev.id">
            {{ dev.name }} ({{ dev.serialNumber }})
          </option>
        </select>
      </AppFormControl>

      <AppFormControl label="Ghi chú" id="install-notes">
        <textarea v-model="form.notes" id="install-notes" rows="2" placeholder="Ghi chú thêm..."></textarea>
      </AppFormControl>
    </div>

    <template #footer>
      <AppButton label="Hủy" variant="ghost" @click="isVisible = false" />
      <AppButton label="Lắp đặt" variant="primary" :loading="loading" @click="handleInstall" />
    </template>
  </AppDialog>
</template>

<style scoped>
.install-info {
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.install-info strong {
  color: var(--color-text-primary);
}
</style>
