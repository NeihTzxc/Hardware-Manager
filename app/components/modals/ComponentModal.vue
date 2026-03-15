<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppDialog from '~/components/ui/AppDialog.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

interface Props {
  modelValue: boolean
  component?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'save'])

const api = useApi()
const { success, error: notifyError } = useNotification()

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.component)
const modalTitle = computed(() => isEdit.value ? 'Sửa thông tin linh kiện' : 'Thêm linh kiện mới')
const submitLabel = computed(() => isEdit.value ? 'Cập nhật' : 'Lưu linh kiện')

const loading = ref(false)
const form = reactive({
  name: '',
  serialNumber: '',
  manufacturer: '',
  categoryId: '',
  status: 'AVAILABLE',
  purchaseDate: '',
  purchasePrice: '',
  warrantyExpiry: '',
  notes: ''
})

const categories = ref<{ id: string; name: string }[]>([])

async function fetchCategories() {
  try {
    const data = await api<{ success: boolean; categories: any[] }>('/api/categories?type=COMPONENT')
    categories.value = data.categories
  } catch (err) {
    console.error('Fetch categories error:', err)
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchCategories()
    if (props.component) {
      form.name = props.component.name
      form.serialNumber = props.component.serialNumber || ''
      form.manufacturer = props.component.manufacturer || ''
      form.categoryId = props.component.categoryId
      form.status = props.component.status
      form.purchaseDate = props.component.purchaseDate ? props.component.purchaseDate.slice(0, 10) : ''
      form.purchasePrice = props.component.purchasePrice?.toString() || ''
      form.warrantyExpiry = props.component.warrantyExpiry ? props.component.warrantyExpiry.slice(0, 10) : ''
      form.notes = props.component.notes || ''
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
    const url = isEdit.value ? `/api/components/${props.component.id}` : '/api/components'

    const data = await api<{ success: boolean; component: any }>(url, {
      method,
      body: form
    })

    if (data.success) {
      success('Thành công', isEdit.value ? 'Linh kiện đã được cập nhật' : 'Linh kiện đã được thêm vào hệ thống')
      emit('save', data.component)
      isVisible.value = false
      resetForm()
    }
  } catch (err: any) {
    const msg = err.data?.message || `Có lỗi xảy ra khi ${isEdit.value ? 'cập nhật' : 'thêm'} linh kiện`
    notifyError('Lỗi', msg)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.name = ''
  form.serialNumber = ''
  form.manufacturer = ''
  form.categoryId = ''
  form.status = 'AVAILABLE'
  form.purchaseDate = ''
  form.purchasePrice = ''
  form.warrantyExpiry = ''
  form.notes = ''
}
</script>

<template>
  <AppDialog v-model="isVisible" :title="modalTitle" size="md" @close="resetForm">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppFormControl label="Tên linh kiện" id="cmp-name" required class="md:col-span-2">
        <input v-model="form.name" id="cmp-name" type="text" placeholder="Ví dụ: Kingston DDR4 8GB 3200MHz" />
      </AppFormControl>

      <AppFormControl label="Số Serial" id="cmp-serial">
        <input v-model="form.serialNumber" id="cmp-serial" type="text" placeholder="Nhập số Serial (nếu có)..." />
      </AppFormControl>

      <AppFormControl label="Danh mục" id="cmp-category" required>
        <select v-model="form.categoryId" id="cmp-category">
          <option value="" disabled selected>Chọn danh mục...</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </AppFormControl>

      <AppFormControl label="Hãng sản xuất" id="cmp-manufacturer">
        <input v-model="form.manufacturer" id="cmp-manufacturer" type="text" placeholder="Ví dụ: Kingston" />
      </AppFormControl>

      <AppFormControl label="Giá mua" id="cmp-price">
        <input v-model="form.purchasePrice" id="cmp-price" type="number" placeholder="VNĐ" />
      </AppFormControl>

      <AppFormControl label="Ngày mua" id="cmp-purchase-date">
        <input v-model="form.purchaseDate" id="cmp-purchase-date" type="date" />
      </AppFormControl>

      <AppFormControl label="Hết bảo hành" id="cmp-warranty">
        <input v-model="form.warrantyExpiry" id="cmp-warranty" type="date" />
      </AppFormControl>

      <AppFormControl v-if="isEdit" label="Trạng thái" id="cmp-status" class="md:col-span-2">
        <select v-model="form.status" id="cmp-status">
          <option value="AVAILABLE">Sẵn sàng</option>
          <option value="INSTALLED">Đã lắp đặt</option>
          <option value="DEFECTIVE">Hỏng</option>
          <option value="DISPOSED">Đã thanh lý</option>
        </select>
      </AppFormControl>

      <AppFormControl label="Ghi chú" id="cmp-notes" class="md:col-span-2">
        <textarea v-model="form.notes" id="cmp-notes" rows="2" placeholder="Ghi chú thêm..."></textarea>
      </AppFormControl>
    </div>

    <template #footer>
      <AppButton label="Hủy" variant="ghost" @click="isVisible = false" />
      <AppButton :label="submitLabel" variant="primary" :loading="loading" @click="handleSave" />
    </template>
  </AppDialog>
</template>
