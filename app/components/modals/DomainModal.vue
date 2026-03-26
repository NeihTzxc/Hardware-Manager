<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppDialog from '~/components/ui/AppDialog.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

interface Props {
  modelValue: boolean
  domain?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'save'])

const api = useApi()
const { success, error: notifyError } = useNotification()

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.domain)
const modalTitle = computed(() => isEdit.value ? 'Sửa thông tin tên miền' : 'Thêm tên miền mới')
const submitLabel = computed(() => isEdit.value ? 'Cập nhật tên miền' : 'Lưu tên miền')

const loading = ref(false)
const form = reactive({
  name: '',
  registrar: '',
  registeredAt: '',
  expiresAt: '',
  autoRenew: false,
  status: 'ACTIVE',
  dnsProvider: '',
  nameservers: '',
  notes: ''
})

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (props.domain) {
      form.name = props.domain.name
      form.registrar = props.domain.registrar || ''
      form.registeredAt = props.domain.registeredAt ? new Date(props.domain.registeredAt).toISOString().split('T')[0] || '' : ''
      form.expiresAt = props.domain.expiresAt ? new Date(props.domain.expiresAt).toISOString().split('T')[0] || '' : ''
      form.autoRenew = !!props.domain.autoRenew
      form.status = props.domain.status
      form.dnsProvider = props.domain.dnsProvider || ''
      form.nameservers = props.domain.nameservers || ''
      form.notes = props.domain.notes || ''
    } else {
      resetForm()
    }
  }
})

async function handleSave() {
  if (loading.value) return
  if (!form.name) return notifyError('Lỗi', 'Tên miền là bắt buộc.')
  
  loading.value = true
  try {
    const method = isEdit.value ? 'PUT' : 'POST'
    const url = isEdit.value ? `/api/domains/${props.domain.id}` : '/api/domains'
    
    // Process form data for dates to avoid null string issues
    const body = {
      ...form,
      registeredAt: form.registeredAt || null,
      expiresAt: form.expiresAt || null
    }
    
    const data = await api<{ success: boolean; domain: any }>(url, {
      method,
      body
    })

    if (data.success) {
      success('Thành công', isEdit.value ? 'Thông tin tên miền đã được cập nhật' : 'Tên miền đã được thêm vào hệ thống')
      emit('save', data.domain)
      isVisible.value = false
      resetForm()
    }
  } catch (err: any) {
    const msg = err.data?.message || `Có lỗi xảy ra khi ${isEdit.value ? 'cập nhật' : 'thêm'} tên miền`
    notifyError('Lỗi', msg)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.name = ''
  form.registrar = ''
  form.registeredAt = ''
  form.expiresAt = ''
  form.autoRenew = false
  form.status = 'ACTIVE'
  form.dnsProvider = ''
  form.nameservers = ''
  form.notes = ''
}
</script>

<template>
  <AppDialog v-model="isVisible" :title="modalTitle" size="lg" @close="resetForm">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppFormControl label="Tên miền (Domain Name)" id="name" required class="md:col-span-2">
        <input v-model="form.name" id="name" type="text" placeholder="Ví dụ: google.com" :disabled="isEdit" />
      </AppFormControl>

      <AppFormControl label="Nhà đăng ký" id="registrar">
        <input v-model="form.registrar" id="registrar" type="text" placeholder="Ví dụ: GoDaddy, Mat Bao..." />
      </AppFormControl>

      <AppFormControl label="Trạng thái" id="status">
        <select v-model="form.status" id="status">
          <option value="ACTIVE">Hoạt động (Active)</option>
          <option value="EXPIRED">Hết hạn (Expired)</option>
          <option value="PENDING">Đang chờ (Pending)</option>
          <option value="SUSPENDED">Tạm ngưng (Suspended)</option>
        </select>
      </AppFormControl>

      <AppFormControl label="Ngày đăng ký" id="registeredAt">
        <input v-model="form.registeredAt" id="registeredAt" type="date" />
      </AppFormControl>

      <AppFormControl label="Ngày hết hạn" id="expiresAt">
        <input v-model="form.expiresAt" id="expiresAt" type="date" />
      </AppFormControl>

      <AppFormControl label="DNS Provider" id="dns">
        <input v-model="form.dnsProvider" id="dns" type="text" placeholder="Ví dụ: Cloudflare, Route53..." />
      </AppFormControl>

      <AppFormControl label="Nameservers" id="ns">
        <input v-model="form.nameservers" id="ns" type="text" placeholder="ns1.com, ns2.com" />
      </AppFormControl>

      <div class="md:col-span-2 py-2">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" v-model="form.autoRenew" class="w-4 h-4 accent-indigo-600 rounded" />
          <span class="text-sm font-medium">Tự động gia hạn (Auto-renew)</span>
        </label>
      </div>

      <AppFormControl label="Ghi chú" id="notes" class="md:col-span-2">
        <textarea v-model="form.notes" id="notes" placeholder="Thông tin thêm về chi phí, hợp đồng..." rows="3"></textarea>
      </AppFormControl>
    </div>

    <template #footer>
      <AppButton label="Hủy" variant="ghost" @click="isVisible = false" />
      <AppButton :label="submitLabel" variant="primary" :loading="loading" @click="handleSave" />
    </template>
  </AppDialog>
</template>
