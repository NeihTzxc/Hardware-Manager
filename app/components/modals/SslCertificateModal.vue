<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import AppDialog from '~/components/ui/AppDialog.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

interface Props {
  modelValue: boolean
  domainId?: string
  certificate?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'save'])

const api = useApi()
const { success, error: notifyError } = useNotification()

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.certificate)
const modalTitle = computed(() => isEdit.value ? 'Sửa chứng chỉ SSL' : 'Thêm chứng chỉ SSL mới')
const submitLabel = computed(() => isEdit.value ? 'Cập nhật chứng chỉ' : 'Lưu chứng chỉ')

const loading = ref(false)
const domains = ref<any[]>([])
const form = reactive({
  domainId: props.domainId || '',
  domainName: '',
  issuer: '',
  type: 'DV',
  status: 'VALID',
  issuedAt: '',
  expiresAt: '',
  autoRenew: false,
  notes: ''
})

async function fetchDomains() {
  try {
    const data = await api<{ success: boolean; domains: any[] }>('/api/domains')
    domains.value = data.domains
  } catch (err) {
    console.error('Fetch domains error:', err)
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    fetchDomains()
    if (props.certificate) {
      form.domainId = props.certificate.domainId || ''
      form.domainName = props.certificate.domainName || ''
      form.issuer = props.certificate.issuer || ''
      form.type = props.certificate.type || 'DV'
      form.status = props.certificate.status
      form.issuedAt = props.certificate.issuedAt ? new Date(props.certificate.issuedAt).toISOString().split('T')[0] || '' : ''
      form.expiresAt = props.certificate.expiresAt ? new Date(props.certificate.expiresAt).toISOString().split('T')[0] || '' : ''
      form.autoRenew = !!props.certificate.autoRenew
      form.notes = props.certificate.notes || ''
    } else {
      resetForm()
      if (props.domainId) {
        form.domainId = props.domainId
      }
    }
  }
})

// Update domainName when domainId changes
watch(() => form.domainId, (newId) => {
  if (newId) {
    const domain = domains.value.find(d => d.id === newId)
    if (domain) {
      form.domainName = domain.name
    }
  }
})

async function handleSave() {
  if (loading.value) return
  if (!form.domainName && !form.domainId) return notifyError('Lỗi', 'Tên miền là bắt buộc.')
  
  loading.value = true
  try {
    const method = isEdit.value ? 'PUT' : 'POST'
    const url = isEdit.value ? `/api/ssl-certificates/${props.certificate.id}` : '/api/ssl-certificates'
    
    const body = {
      ...form,
      domainId: form.domainId || null,
      issuedAt: form.issuedAt || null,
      expiresAt: form.expiresAt || null
    }
    
    const data = await api<{ success: boolean; certificate: any }>(url, {
      method,
      body
    })

    if (data.success) {
      success('Thành công', isEdit.value ? 'Chứng chỉ SSL đã được cập nhật' : 'Chứng chỉ SSL đã được thêm thành công')
      emit('save', data.certificate)
      isVisible.value = false
      resetForm()
    }
  } catch (err: any) {
    const msg = err.data?.message || `Có lỗi xảy ra khi ${isEdit.value ? 'cập nhật' : 'thêm'} chứng chỉ SSL`
    notifyError('Lỗi', msg)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.domainId = props.domainId || ''
  form.domainName = ''
  form.issuer = ''
  form.type = 'DV'
  form.status = 'VALID'
  form.issuedAt = ''
  form.expiresAt = ''
  form.autoRenew = false
  form.notes = ''
}
</script>

<template>
  <AppDialog v-model="isVisible" :title="modalTitle" size="md" @close="resetForm">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppFormControl label="Liên kết Domain hệ thống (Không bắt buộc)" id="domainId" class="md:col-span-2">
        <select v-model="form.domainId" id="domainId" :disabled="isEdit">
          <option value="">-- Không liên kết --</option>
          <option v-for="d in domains" :key="d.id" :value="d.id">
            {{ d.name }}
          </option>
        </select>
      </AppFormControl>

      <AppFormControl label="Tên miền áp dụng (Domain Name)" id="domainName" required class="md:col-span-2">
        <input v-model="form.domainName" id="domainName" type="text" placeholder="Ví dụ: mydomain.com" />
      </AppFormControl>

      <AppFormControl label="Nhà cấp phát (Issuer)" id="issuer" required class="md:col-span-2">
        <input v-model="form.issuer" id="issuer" type="text" placeholder="Ví dụ: Let's Encrypt, ZeroSSL, DigiCert..." />
      </AppFormControl>

      <AppFormControl label="Loại chứng chỉ" id="type">
        <select v-model="form.type" id="type">
          <option value="DV">DV (Domain Validation)</option>
          <option value="OV">OV (Organization Validation)</option>
          <option value="EV">EV (Extended Validation)</option>
          <option value="WILDCARD">Wildcard (*.domain.com)</option>
        </select>
      </AppFormControl>

      <AppFormControl label="Trạng thái" id="status">
        <select v-model="form.status" id="status">
          <option value="VALID">Đang hiệu lực (Valid)</option>
          <option value="EXPIRING_SOON">Sắp hết hạn</option>
          <option value="EXPIRED">Đã hết hạn</option>
          <option value="REVOKED">Đã bị thu hồi</option>
        </select>
      </AppFormControl>

      <AppFormControl label="Ngày cấp" id="issuedAt">
        <input v-model="form.issuedAt" id="issuedAt" type="date" />
      </AppFormControl>

      <AppFormControl label="Ngày hết hạn" id="expiresAt">
        <input v-model="form.expiresAt" id="expiresAt" type="date" />
      </AppFormControl>

      <div class="md:col-span-2 py-1">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" v-model="form.autoRenew" class="w-4 h-4 accent-indigo-600 rounded" />
          <span class="text-sm font-medium">Tự động gia hạn (Auto-renew)</span>
        </label>
      </div>

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
