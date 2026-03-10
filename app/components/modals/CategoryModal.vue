<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppDialog from '~/components/ui/AppDialog.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

interface Props {
  modelValue: boolean
  category?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'save'])

const api = useApi()
const { success, error: notifyError } = useNotification()

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.category)
const modalTitle = computed(() => isEdit.value ? 'Sửa danh mục' : 'Thêm danh mục mới')
const submitLabel = computed(() => isEdit.value ? 'Cập nhật danh mục' : 'Lưu danh mục')

const loading = ref(false)
const form = reactive({
  name: '',
  description: ''
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (props.category) {
      form.name = props.category.name
      form.description = props.category.description || ''
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
    const url = isEdit.value ? `/api/categories/${props.category.id}` : '/api/categories'
    
    const data = await api<{ success: boolean; category: any }>(url, {
      method,
      body: form
    })

    if (data.success) {
      success('Thành công', isEdit.value ? 'Danh mục đã được cập nhật' : 'Danh mục đã được thêm vào hệ thống')
      emit('save', data.category)
      isVisible.value = false
      resetForm()
    }
  } catch (err: any) {
    const msg = err.data?.message || `Có lỗi xảy ra khi ${isEdit.value ? 'cập nhật' : 'thêm'} danh mục`
    notifyError('Lỗi', msg)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.name = ''
  form.description = ''
}
</script>

<template>
  <AppDialog v-model="isVisible" :title="modalTitle" size="md" @close="resetForm">
    <div class="space-y-4">
      <AppFormControl label="Tên danh mục" id="name" required>
        <input v-model="form.name" id="name" type="text" placeholder="Ví dụ: Laptop, Điện thoại..." />
      </AppFormControl>

      <AppFormControl label="Mô tả" id="description">
        <textarea v-model="form.description" id="description" rows="3" placeholder="Ghi chú thêm về danh mục này..."></textarea>
      </AppFormControl>
    </div>

    <template #footer>
      <AppButton label="Hủy" variant="ghost" @click="isVisible = false" />
      <AppButton :label="submitLabel" variant="primary" :loading="loading" @click="handleSave" />
    </template>
  </AppDialog>
</template>
