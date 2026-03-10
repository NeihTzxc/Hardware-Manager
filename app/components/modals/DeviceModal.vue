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

const isEdit = computed(() => !!props.device)
const modalTitle = computed(() => isEdit.value ? 'Sửa thông tin thiết bị' : 'Thêm thiết bị mới')
const submitLabel = computed(() => isEdit.value ? 'Cập nhật thiết bị' : 'Lưu thiết bị')

const loading = ref(false)
const form = reactive({
  name: '',
  serialNumber: '',
  model: '',
  manufacturer: '',
  categoryId: '',
  status: 'AVAILABLE'
})

const categories = ref<{ id: string; name: string }[]>([])

// Fetch categories from API
async function fetchCategories() {
  try {
    const data = await api<{ success: boolean; categories: any[] }>('/api/categories')
    categories.value = data.categories
  } catch (err) {
    console.error('Fetch categories error:', err)
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchCategories()
    if (props.device) {
      form.name = props.device.name
      form.serialNumber = props.device.serialNumber
      form.model = props.device.model || ''
      form.manufacturer = props.device.manufacturer || ''
      form.categoryId = props.device.categoryId
      form.status = props.device.status
    } else {
      resetForm()
    }
  }
})

async function handleSave() {
  if (loading.value) return
  
  loading.value = true
  try {
    const method = isEdit.value ? 'PUT' : 'POST'
    const url = isEdit.value ? `/api/devices/${props.device.id}` : '/api/devices'
    
    const data = await api<{ success: boolean; device: any }>(url, {
      method,
      body: form
    })

    if (data.success) {
      success('Thành công', isEdit.value ? 'Thông tin thiết bị đã được cập nhật' : 'Thiết bị đã được thêm vào hệ thống')
      emit('save', data.device)
      isVisible.value = false
      resetForm()
    }
  } catch (err: any) {
    const msg = err.data?.message || `Có lỗi xảy ra khi ${isEdit.value ? 'cập nhật' : 'thêm'} thiết bị`
    notifyError('Lỗi', msg)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.name = ''
  form.serialNumber = ''
  form.model = ''
  form.manufacturer = ''
  form.categoryId = ''
  form.status = 'AVAILABLE'
}
</script>

<template>
  <AppDialog v-model="isVisible" :title="modalTitle" size="md" @close="resetForm">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppFormControl label="Tên thiết bị" id="name" required class="md:col-span-2">
        <input v-model="form.name" id="name" type="text" placeholder="Ví dụ: MacBook Pro 2023" />
      </AppFormControl>

      <AppFormControl label="Số Serial" id="serial" required>
        <input v-model="form.serialNumber" id="serial" type="text" placeholder="Nhập số Serial..." />
      </AppFormControl>

      <AppFormControl label="Danh mục" id="category" required>
        <select v-model="form.categoryId" id="category">
          <option value="" disabled selected>Chọn danh mục...</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </AppFormControl>

      <AppFormControl label="Model" id="model">
        <input v-model="form.model" id="model" type="text" placeholder="Ví dụ: A2779" />
      </AppFormControl>

      <AppFormControl label="Hãng sản xuất" id="manufacturer">
        <input v-model="form.manufacturer" id="manufacturer" type="text" placeholder="Ví dụ: Apple" />
      </AppFormControl>

      <AppFormControl v-if="isEdit" label="Trạng thái" id="status" class="md:col-span-2">
        <select v-model="form.status" id="status">
          <option value="AVAILABLE">Sẵn sàng</option>
          <option value="IN_USE">Đang sử dụng</option>
          <option value="MAINTENANCE">Bảo trì</option>
          <option value="RETIRED">Ngừng sử dụng</option>
          <option value="LOST">Mất</option>
        </select>
      </AppFormControl>
    </div>

    <template #footer>
      <AppButton label="Hủy" variant="ghost" @click="isVisible = false" />
      <AppButton :label="submitLabel" variant="primary" :loading="loading" @click="handleSave" />
    </template>
  </AppDialog>
</template>
