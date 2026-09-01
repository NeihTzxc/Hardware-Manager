<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppDialog from '~/components/ui/AppDialog.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

const props = defineProps<{
  modelValue: boolean
  user: any | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: [count: number]
}>()

const api = useApi()
const { success, error: notifyError } = useNotification()
const loading = ref(false)

const isVisible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const formItems = ref<any[]>([])

const conditions = [
  { value: 'NEW', label: 'Mới' },
  { value: 'GOOD', label: 'Tốt' },
  { value: 'FAIR', label: 'Bình thường' },
  { value: 'POOR', label: 'Kém' },
  { value: 'DAMAGED', label: 'Hỏng' }
]

watch(() => props.modelValue, visible => {
  if (!visible) return
  formItems.value = (props.user?.assignments || []).map((assignment: any) => ({
    assignmentId: assignment.id,
    deviceName: assignment.device.name,
    serialNumber: assignment.device.serialNumber,
    conditionAfter: assignment.device.condition || 'GOOD',
    notes: ''
  }))
}, { immediate: true })

async function reclaimDevices() {
  if (!props.user || formItems.value.length === 0) return

  loading.value = true
  try {
    const result = await api<{ success: boolean; count: number; message: string }>(`/api/users/${props.user.id}/reclaim-devices`, {
      method: 'POST',
      body: { items: formItems.value.map(({ assignmentId, conditionAfter, notes }) => ({ assignmentId, conditionAfter, notes })) }
    })
    if (result.success) {
      success('Thu hồi thành công', result.message)
      emit('success', result.count)
      isVisible.value = false
    }
  } catch (err: any) {
    notifyError('Không thể thu hồi', err.data?.message || 'Có lỗi xảy ra khi thu hồi thiết bị.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppDialog v-model="isVisible" title="Thu hồi thiết bị khi nhân viên nghỉ việc" size="lg">
    <div v-if="user" class="space-y-5">
      <div class="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-secondary">
        Thu hồi toàn bộ <b>{{ formItems.length }}</b> thiết bị đang được cấp cho
        <b>{{ user.name || user.email }}</b>. Sau khi xác nhận, các thiết bị sẽ về trạng thái <b>Sẵn sàng</b>.
      </div>

      <div v-if="formItems.length" class="space-y-4">
        <div v-for="item in formItems" :key="item.assignmentId" class="rounded-lg border border-border bg-surface p-4">
          <div class="mb-3">
            <div class="font-semibold text-sm">{{ item.deviceName }}</div>
            <div class="text-xs text-muted">{{ item.serialNumber || 'Không có số serial' }}</div>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AppFormControl label="Tình trạng khi thu hồi" :id="`condition-${item.assignmentId}`">
              <select v-model="item.conditionAfter" :id="`condition-${item.assignmentId}`">
                <option v-for="condition in conditions" :key="condition.value" :value="condition.value">{{ condition.label }}</option>
              </select>
            </AppFormControl>
            <AppFormControl label="Ghi chú" :id="`notes-${item.assignmentId}`">
              <input v-model="item.notes" :id="`notes-${item.assignmentId}`" placeholder="Ví dụ: đã đủ sạc, không trầy xước" />
            </AppFormControl>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-muted">Nhân viên này hiện không có thiết bị nào cần thu hồi.</p>
    </div>

    <template #footer>
      <AppButton label="Hủy" variant="ghost" @click="isVisible = false" />
      <AppButton label="Xác nhận thu hồi" variant="primary" :loading="loading" :disabled="formItems.length === 0" @click="reclaimDevices" />
    </template>
  </AppDialog>
</template>
