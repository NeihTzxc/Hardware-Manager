<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppDialog from '~/components/ui/AppDialog.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

interface Props {
  modelValue: boolean
  software?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'save'])

const api = useApi()
const { success, error: notifyError } = useNotification()

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.software)
const modalTitle = computed(() => isEdit.value ? 'Sửa thông tin phần mềm' : 'Thêm phần mềm mới')
const submitLabel = computed(() => isEdit.value ? 'Cập nhật' : 'Lưu')

const loading = ref(false)
const form = reactive({
  name: '',
  vendor: '',
  version: '',
  category: '',
  website: '',
  notes: ''
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (props.software) {
      form.name = props.software.name
      form.vendor = props.software.vendor || ''
      form.version = props.software.version || ''
      form.category = props.software.category || ''
      form.website = props.software.website || ''
      form.notes = props.software.notes || ''
    } else {
      resetForm()
    }
  }
})

async function handleSave() {
  if (loading.value) return
  if (!form.name) return notifyError('Lỗi', 'Tên phần mềm là bắt buộc.')
  
  loading.value = true
  try {
    const method = isEdit.value ? 'PUT' : 'POST'
    const url = isEdit.value ? `/api/software/${props.software.id}` : '/api/software'
    
    const data = await api<{ success: boolean; software: any }>(url, {
      method,
      body: form
    })

    if (data.success) {
      success('Thành công', isEdit.value ? 'Thông tin phần mềm đã được cập nhật' : 'Phần mềm đã được thêm thành công')
      emit('save', data.software)
      isVisible.value = false
      resetForm()
    }
  } catch (err: any) {
    const msg = err.data?.message || `Có lỗi xảy ra khi ${isEdit.value ? 'cập nhật' : 'thêm'} phần mềm`
    notifyError('Lỗi', msg)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.name = ''
  form.vendor = ''
  form.version = ''
  form.category = ''
  form.website = ''
  form.notes = ''
}
</script>

<template>
  <AppDialog v-model="isVisible" :title="modalTitle" size="md" @close="resetForm">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppFormControl label="Tên phần mềm" id="name" required class="md:col-span-2">
        <input v-model="form.name" id="name" type="text" placeholder="Ví dụ: Microsoft Office 2021" />
      </AppFormControl>

      <AppFormControl label="Nhà cung cấp / Phát triển" id="vendor">
        <input v-model="form.vendor" id="vendor" type="text" placeholder="Ví dụ: Microsoft" />
      </AppFormControl>

      <AppFormControl label="Phiên bản" id="version">
        <input v-model="form.version" id="version" type="text" placeholder="Ví dụ: 16.0" />
      </AppFormControl>

      <AppFormControl label="Danh mục" id="category">
        <input v-model="form.category" id="category" type="text" placeholder="Ví dụ: Office, Security..." />
      </AppFormControl>

      <AppFormControl label="Website" id="website">
        <input v-model="form.website" id="website" type="text" placeholder="https://..." />
      </AppFormControl>

      <AppFormControl label="Ghi chú" id="notes" class="md:col-span-2">
        <textarea v-model="form.notes" id="notes" placeholder="Thông tin thêm..." rows="3"></textarea>
      </AppFormControl>
    </div>

    <template #footer>
      <AppButton label="Hủy" variant="ghost" @click="isVisible = false" />
      <AppButton :label="submitLabel" variant="primary" :loading="loading" @click="handleSave" />
    </template>
  </AppDialog>
</template>
