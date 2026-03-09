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
  name: '',
  serialNumber: '',
  model: '',
  manufacturer: '',
  categoryId: ''
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
  }
})

async function handleSave() {
  if (loading.value) return
  
  loading.value = true
  try {
    const data = await api<{ success: boolean; device: any }>('/api/devices', {
      method: 'POST',
      body: form
    })

    if (data.success) {
      success('Thành công', 'Thiết bị đã được thêm vào hệ thống')
      emit('save', data.device)
      isVisible.value = false
      resetForm()
    }
  } catch (err: any) {
    const msg = err.data?.message || 'Có lỗi xảy ra khi thêm thiết bị'
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
}
</script>

<template>
  <AppDialog v-model="isVisible" title="Thêm thiết bị mới" size="md" @close="resetForm">
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
    </div>

    <template #footer>
      <AppButton label="Hủy" variant="ghost" @click="isVisible = false" />
      <AppButton label="Lưu thiết bị" variant="primary" icon="pi pi-check" :loading="loading" @click="handleSave" />
    </template>
  </AppDialog>
</template>
