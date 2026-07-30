<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppDialog from '~/components/ui/AppDialog.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

interface Props {
  modelValue: boolean
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
  title: '',
  description: '',
  type: 'HARDWARE_REQUEST',
  priority: 'MEDIUM',
  deviceId: ''
})

const devices = ref<{ id: string; name: string, serialNumber: string | null }[]>([])

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

async function handleSave() {
  if (!form.title || !form.description) {
    notifyError('Lỗi', 'Vui lòng nhập đầy đủ tiêu đề và nội dung.')
    return
  }

  if (loading.value) return
  
  loading.value = true
  try {
    const data = await api<{ success: boolean; ticket: any }>('/api/tickets', {
      method: 'POST',
      body: {
        title: form.title,
        description: form.description,
        type: form.type,
        priority: form.priority,
        deviceId: form.deviceId || undefined
      }
    })

    if (data.success) {
      success('Thành công', 'Yêu cầu đã được gửi đến bộ phận Hỗ trợ.')
      emit('save', data.ticket)
      isVisible.value = false
      resetForm()
    }
  } catch (err: any) {
    const msg = err.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu'
    notifyError('Lỗi', msg)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.title = ''
  form.description = ''
  form.type = 'HARDWARE_REQUEST'
  form.priority = 'MEDIUM'
  form.deviceId = ''
}
</script>

<template>
  <AppDialog v-model="isVisible" title="Tạo Yêu cầu / Ticket mới" size="md" @close="resetForm">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppFormControl label="Tiêu đề" id="title" required class="md:col-span-2">
        <input v-model="form.title" id="title" type="text" placeholder="Tóm tắt yêu cầu..." />
      </AppFormControl>

      <AppFormControl label="Loại yêu cầu" id="type" required>
        <select v-model="form.type" id="type">
          <option value="HARDWARE_REQUEST">Yêu cầu thiết bị mới</option>
          <option value="HARDWARE_ISSUE">Sự cố thiết bị (hỏng hóc)</option>
          <option value="SOFTWARE_REQUEST">Yêu cầu phần mềm</option>
          <option value="SOFTWARE_ISSUE">Sự cố phần mềm</option>
          <option value="OTHER">Khác</option>
        </select>
      </AppFormControl>

      <AppFormControl label="Mức độ ưu tiên" id="priority" required>
        <select v-model="form.priority" id="priority">
          <option value="LOW">Thấp</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HIGH">Cao</option>
          <option value="URGENT">Khẩn cấp</option>
        </select>
      </AppFormControl>

      <AppFormControl label="Thiết bị liên quan (nếu có)" id="device" class="md:col-span-2">
        <select v-model="form.deviceId" id="device">
          <option value="" selected>-- Không chọn --</option>
          <option v-for="dev in devices" :key="dev.id" :value="dev.id">
            {{ dev.name }} ({{ dev.serialNumber || 'Không có serial' }})
          </option>
        </select>
      </AppFormControl>

      <AppFormControl label="Nội dung chi tiết" id="description" required class="md:col-span-2">
        <textarea v-model="form.description" id="description" rows="4" placeholder="Mô tả chi tiết yêu cầu..."></textarea>
      </AppFormControl>
    </div>

    <template #footer>
      <AppButton label="Hủy" variant="ghost" @click="isVisible = false" />
      <AppButton label="Gửi Yêu cầu" variant="primary" :loading="loading" @click="handleSave" />
    </template>
  </AppDialog>
</template>
