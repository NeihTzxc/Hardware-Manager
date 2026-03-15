<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppDialog from '~/components/ui/AppDialog.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

interface Props {
  modelValue: boolean
  accessory?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'save'])

const api = useApi()
const { success, error: notifyError } = useNotification()

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.accessory)
const modalTitle = computed(() => isEdit.value ? 'Sửa thông tin phụ kiện' : 'Thêm phụ kiện mới')
const submitLabel = computed(() => isEdit.value ? 'Cập nhật' : 'Lưu phụ kiện')

const loading = ref(false)
const form = reactive({
  name: '',
  categoryId: '',
  manufacturer: '',
  totalQuantity: '',
  minQuantity: '',
  unitPrice: '',
  notes: ''
})

const categories = ref<{ id: string; name: string }[]>([])

async function fetchCategories() {
  try {
    const data = await api<{ success: boolean; categories: any[] }>('/api/categories?type=ACCESSORY')
    categories.value = data.categories
  } catch (err) {
    console.error('Fetch categories error:', err)
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchCategories()
    if (props.accessory) {
      form.name = props.accessory.name
      form.categoryId = props.accessory.categoryId
      form.manufacturer = props.accessory.manufacturer || ''
      form.totalQuantity = props.accessory.totalQuantity?.toString() || ''
      form.minQuantity = props.accessory.minQuantity?.toString() || ''
      form.unitPrice = props.accessory.unitPrice?.toString() || ''
      form.notes = props.accessory.notes || ''
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
    const url = isEdit.value ? `/api/accessories/${props.accessory.id}` : '/api/accessories'

    const data = await api<{ success: boolean; accessory: any }>(url, {
      method,
      body: form
    })

    if (data.success) {
      success('Thành công', isEdit.value ? 'Phụ kiện đã được cập nhật' : 'Phụ kiện đã được thêm vào hệ thống')
      emit('save', data.accessory)
      isVisible.value = false
      resetForm()
    }
  } catch (err: any) {
    const msg = err.data?.message || `Có lỗi xảy ra khi ${isEdit.value ? 'cập nhật' : 'thêm'} phụ kiện`
    notifyError('Lỗi', msg)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.name = ''
  form.categoryId = ''
  form.manufacturer = ''
  form.totalQuantity = ''
  form.minQuantity = ''
  form.unitPrice = ''
  form.notes = ''
}
</script>

<template>
  <AppDialog v-model="isVisible" :title="modalTitle" size="md" @close="resetForm">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppFormControl label="Tên phụ kiện" id="acc-name" required class="md:col-span-2">
        <input v-model="form.name" id="acc-name" type="text" placeholder="Ví dụ: Chuột Logitech M185" />
      </AppFormControl>

      <AppFormControl label="Danh mục" id="acc-category" required>
        <select v-model="form.categoryId" id="acc-category">
          <option value="" disabled selected>Chọn danh mục...</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </AppFormControl>

      <AppFormControl label="Hãng sản xuất" id="acc-manufacturer">
        <input v-model="form.manufacturer" id="acc-manufacturer" type="text" placeholder="Ví dụ: Logitech" />
      </AppFormControl>

      <AppFormControl label="Tổng số lượng" id="acc-total-qty" required>
        <input v-model="form.totalQuantity" id="acc-total-qty" type="number" min="0" placeholder="0" />
      </AppFormControl>

      <AppFormControl label="SL tồn kho tối thiểu" id="acc-min-qty">
        <input v-model="form.minQuantity" id="acc-min-qty" type="number" min="0" placeholder="0" />
      </AppFormControl>

      <AppFormControl label="Đơn giá (VNĐ)" id="acc-price" class="md:col-span-2">
        <input v-model="form.unitPrice" id="acc-price" type="number" placeholder="VNĐ" />
      </AppFormControl>

      <AppFormControl label="Ghi chú" id="acc-notes" class="md:col-span-2">
        <textarea v-model="form.notes" id="acc-notes" rows="2" placeholder="Ghi chú thêm..."></textarea>
      </AppFormControl>
    </div>

    <template #footer>
      <AppButton label="Hủy" variant="ghost" @click="isVisible = false" />
      <AppButton :label="submitLabel" variant="primary" :loading="loading" @click="handleSave" />
    </template>
  </AppDialog>
</template>
