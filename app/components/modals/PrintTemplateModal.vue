<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppDialog from '~/components/ui/AppDialog.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

const props = defineProps<{
  modelValue: boolean
  template?: any
}>()

const emit = defineEmits(['update:modelValue', 'saved'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const { success, error: notifyError } = useNotification()
const api = useApi()

const isSubmitting = ref(false)
const form = ref({
  name: '',
  description: '',
  type: 'HANDOVER',
  content: '',
  isDefault: false
})

watch(() => props.template, (newTemplate) => {
  if (newTemplate) {
    form.value = {
      name: newTemplate.name,
      description: newTemplate.description || '',
      type: newTemplate.type,
      content: newTemplate.content,
      isDefault: newTemplate.isDefault
    }
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  form.value = {
    name: '',
    description: '',
    type: 'HANDOVER',
    content: `<!-- Template HTML mẫu -->
<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
  <h2 style="text-align: center;">BIÊN BẢN GIAO NHẬN THIẾT BỊ</h2>
  <p><strong>Ngày giao nhận:</strong> {{date}}</p>
  <p><strong>Tên người nhận:</strong> {{userName}}</p>
  <p><strong>Thiết bị:</strong> {{deviceName}}</p>
  <p><strong>Số Seri:</strong> {{serialNumber}}</p>
  <br/>
  <div style="display: flex; justify-content: space-between; margin-top: 50px;">
    <div><strong>Người giao</strong><br/><br/><br/>Ký tên</div>
    <div><strong>Người nhận</strong><br/><br/><br/>Ký tên</div>
  </div>
</div>`,
    isDefault: false
  }
}

async function handleSubmit() {
  if (!form.value.name || !form.value.content || !form.value.type) {
    notifyError('Lỗi', 'Vui lòng điền đầy đủ các thông tin bắt buộc (Tên, Loại, Nội dung).')
    return
  }

  isSubmitting.value = true
  try {
    const isEditing = !!props.template
    const url = isEditing 
      ? `/api/print-templates/${props.template.id}` 
      : '/api/print-templates'
    const method = isEditing ? 'PUT' : 'POST'

    const data = await api<{ success: boolean; template: any }>(url, {
      method,
      body: form.value
    })

    if (data.success) {
      success('Thành công', isEditing ? 'Cập nhật biểu mẫu thành công' : 'Đã tạo biểu mẫu mới')
      emit('saved', data.template)
      isOpen.value = false
    }
  } catch (err: any) {
    const msg = err.data?.message || 'Có lỗi xảy ra khi lưu biểu mẫu'
    notifyError('Lỗi', msg)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AppDialog 
    v-model="isOpen" 
    :title="props.template ? 'Cập nhật Biểu mẫu In' : 'Thêm Biểu mẫu In mới'"
    size="lg"
  >
    <div class="space-y-4">
      <div class="grid-2">
        <AppFormControl label="Tên biểu mẫu" id="template-name" required>
          <input 
            v-model="form.name" 
            id="template-name" 
            type="text" 
            placeholder="VD: Mẫu giao máy Mac 2026"
          />
        </AppFormControl>
        <AppFormControl label="Loại biểu mẫu" id="template-type" required>
          <select v-model="form.type" id="template-type">
            <option value="HANDOVER">Giao thiết bị (Handover)</option>
            <option value="RETURN">Thu hồi thiết bị (Return)</option>
          </select>
        </AppFormControl>
      </div>

      <AppFormControl label="Mô tả" id="template-desc">
        <input 
          v-model="form.description" 
          id="template-desc" 
          type="text" 
          placeholder="Mô tả ngắn về biểu mẫu này..."
        />
      </AppFormControl>

      <div class="checkbox-container">
        <label class="flex-center cursor-pointer">
          <input type="checkbox" v-model="form.isDefault" class="mr-2" />
          <span class="text-sm font-medium">Đặt làm biểu mẫu mặc định cho loại này</span>
        </label>
      </div>

      <AppFormControl label="Nội dung mã HTML" id="template-content" required>
        <div class="text-xs text-muted mb-2">
          Các biến có sẵn: <b v-pre>{{userName}}</b>, <b v-pre>{{userEmail}}</b>, 
          <b v-pre>{{deviceName}}</b>, <b v-pre>{{serialNumber}}</b>, 
          <b v-pre>{{date}}</b>, <b v-pre>{{condition}}</b>, <b v-pre>{{deviceList}}</b>
        </div>
        <textarea 
          v-model="form.content" 
          id="template-content" 
          rows="15" 
          class="html-editor font-mono text-sm leading-relaxed"
          placeholder="Nhập mã HTML của biểu mẫu..."
        ></textarea>
      </AppFormControl>
    </div>

    <template #footer>
      <AppButton 
        label="Hủy" 
        variant="ghost" 
        @click="isOpen = false" 
      />
      <AppButton 
        :label="props.template ? 'Cập nhật' : 'Tạo mới'" 
        variant="primary" 
        :loading="isSubmitting"
        @click="handleSubmit" 
      />
    </template>
  </AppDialog>
</template>

<style scoped>
.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.checkbox-container {
  padding: var(--spacing-sm) 0;
}

.flex-center {
  display: flex;
  align-items: center;
}

.mr-2 {
  margin-right: var(--spacing-sm);
}

.cursor-pointer {
  cursor: pointer;
}

.html-editor {
  font-family: 'Courier New', Courier, monospace;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  width: 100%;
  resize: vertical;
}

.html-editor:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}
</style>
