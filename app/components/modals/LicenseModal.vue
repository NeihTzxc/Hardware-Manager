<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppDialog from '~/components/ui/AppDialog.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

interface Props {
  modelValue: boolean
  softwareId?: string
  license?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'save'])

const api = useApi()
const { success, error: notifyError } = useNotification()

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.license)
const modalTitle = computed(() => isEdit.value ? 'Sửa thông tin giấy phép' : 'Thêm giấy phép mới')
const submitLabel = computed(() => isEdit.value ? 'Cập nhật' : 'Lưu')

const loading = ref(false)
const softwareList = ref<any[]>([])
const form = reactive({
  softwareId: props.softwareId || '',
  licenseKey: '',
  type: 'SUBSCRIPTION',
  status: 'ACTIVE',
  seats: 1,
  assignedTo: '',
  purchasedAt: '',
  expiresAt: '',
  cost: '',
  notes: ''
})

async function fetchSoftware() {
  try {
    const data = await api<{ success: boolean; software: any[] }>('/api/software')
    softwareList.value = data.software
  } catch (err) {
    console.error('Fetch software error:', err)
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchSoftware()
    if (props.license) {
      form.softwareId = props.license.softwareId
      form.licenseKey = props.license.licenseKey || ''
      form.type = props.license.type
      form.status = props.license.status
      form.seats = props.license.seats
      form.assignedTo = props.license.assignedTo || ''
      form.purchasedAt = props.license.purchasedAt ? new Date(props.license.purchasedAt).toISOString().split('T')[0] || '' : ''
      form.expiresAt = props.license.expiresAt ? new Date(props.license.expiresAt).toISOString().split('T')[0] || '' : ''
      form.cost = props.license.cost?.toString() || ''
      form.notes = props.license.notes || ''
    } else {
      resetForm()
      if (props.softwareId) {
        form.softwareId = props.softwareId
      }
    }
  }
})

async function handleSave() {
  if (loading.value) return
  if (!form.softwareId) return notifyError('Lỗi', 'Phần mềm là bắt buộc.')
  
  loading.value = true
  try {
    const method = isEdit.value ? 'PUT' : 'POST'
    const url = isEdit.value ? `/api/licenses/${props.license.id}` : '/api/licenses'
    
    const data = await api<{ success: boolean; license: any }>(url, {
      method,
      body: form
    })

    if (data.success) {
      success('Thành công', isEdit.value ? 'Thông tin giấy phép đã được cập nhật' : 'Giấy phép đã được thêm thành công')
      emit('save', data.license)
      isVisible.value = false
      resetForm()
    }
  } catch (err: any) {
    const msg = err.data?.message || `Có lỗi xảy ra khi ${isEdit.value ? 'cập nhật' : 'thêm'} giấy phép`
    notifyError('Lỗi', msg)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.softwareId = props.softwareId || ''
  form.licenseKey = ''
  form.type = 'SUBSCRIPTION'
  form.status = 'ACTIVE'
  form.seats = 1
  form.assignedTo = ''
  form.purchasedAt = ''
  form.expiresAt = ''
  form.cost = ''
  form.notes = ''
}
</script>

<template>
  <AppDialog v-model="isVisible" :title="modalTitle" size="md" @close="resetForm">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppFormControl label="Phần mềm" id="software" required class="md:col-span-2">
        <select v-model="form.softwareId" id="software" :disabled="isEdit">
          <option value="" disabled selected>Chọn phần mềm...</option>
          <option v-for="s in softwareList" :key="s.id" :value="s.id">
            {{ s.name }}
          </option>
        </select>
      </AppFormControl>

      <AppFormControl label="License Key" id="key" class="md:col-span-2">
        <input v-model="form.licenseKey" id="key" type="text" placeholder="Nhập key kích hoạt..." />
      </AppFormControl>

      <AppFormControl label="Loại giấy phép" id="type">
        <select v-model="form.type" id="type">
          <option value="PERPETUAL">Vĩnh viễn (Perpetual)</option>
          <option value="SUBSCRIPTION">Theo kỳ hạn (Subscription)</option>
          <option value="OEM">OEM</option>
          <option value="FREEWARE">Miễn phí</option>
          <option value="OPEN_SOURCE">Mã nguồn mở</option>
        </select>
      </AppFormControl>

      <AppFormControl label="Trạng thái" id="status">
        <select v-model="form.status" id="status">
          <option value="ACTIVE">Đang sử dụng</option>
          <option value="EXPIRED">Đã hết hạn</option>
          <option value="REVOKED">Bị thu hồi</option>
          <option value="UNUSED">Chưa dùng</option>
        </select>
      </AppFormControl>

      <AppFormControl label="Số lượng máy (Seats)" id="seats">
        <input v-model="form.seats" id="seats" type="number" min="1" />
      </AppFormControl>

      <AppFormControl label="Người sở hữu/Bộ phận" id="assigned">
        <input v-model="form.assignedTo" id="assigned" type="text" placeholder="Ví dụ: Phòng Kỹ thuật" />
      </AppFormControl>

      <AppFormControl label="Ngày mua" id="purchasedAt">
        <input v-model="form.purchasedAt" id="purchasedAt" type="date" />
      </AppFormControl>

      <AppFormControl label="Ngày hết hạn" id="expiresAt">
        <input v-model="form.expiresAt" id="expiresAt" type="date" />
      </AppFormControl>

      <AppFormControl label="Chi phí" id="cost">
        <input v-model="form.cost" id="cost" type="number" step="0.01" placeholder="Nhập số tiền..." />
      </AppFormControl>

      <AppFormControl label="Ghi chú" id="notes" class="md:col-span-2">
        <textarea v-model="form.notes" id="notes" placeholder="Thông tin thêm..." rows="2"></textarea>
      </AppFormControl>
    </div>

    <template #footer>
      <AppButton label="Hủy" variant="ghost" @click="isVisible = false" />
      <AppButton :label="submitLabel" variant="primary" :loading="loading" @click="handleSave" />
    </template>
  </AppDialog>
</template>
