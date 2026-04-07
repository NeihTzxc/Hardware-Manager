<script setup lang="ts">
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'
import AppDialog from '~/components/ui/AppDialog.vue'
import AppButton from '~/components/ui/AppButton.vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: 'Nhập dữ liệu từ Excel/CSV' },
  templateUrl: { type: String, default: '' },
  importApiUrl: { type: String, required: true },
  dataKey: { type: String, default: 'data' }, // Tên key khi post ví dụ: { devices: [...] }
  columnMapping: { type: Object as () => Record<string, string>, required: true },
  requiredColumns: { type: Array as () => string[], default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'success'])
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const parsedData = ref<any[]>([])
const headers = ref<string[]>([])
const isDragging = ref(false)
const isParsing = ref(false)
const isUploading = ref(false)
const errorMsg = ref('')

const importResults = ref<{
  successCount: number;
  skippedCount: number;
  errors: string[];
} | null>(null)

// Reset state when strictly closing
watch(isOpen, (newVal) => {
  if (!newVal) {
    setTimeout(resetState, 300)
  }
})

function resetState() {
  selectedFile.value = null
  parsedData.value = []
  headers.value = []
  errorMsg.value = ''
  importResults.value = null
  if (fileInput.value) fileInput.value.value = ''
}

// File Drag & Drop Handlers
function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}
function onDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0])
  }
}
function triggerFileSelect() {
  fileInput.value?.click()
}
function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFile(target.files[0])
  }
}

// Parsing Logic
function handleFile(file: File) {
  errorMsg.value = ''
  importResults.value = null
  
  const validTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!validTypes.includes(file.type) && !['csv', 'xls', 'xlsx'].includes(ext || '')) {
    errorMsg.value = 'Chỉ hỗ trợ định dạng file CSV, XLS, XLSX'
    return
  }

  selectedFile.value = file
  parseFile(file)
}

function parseFile(file: File) {
  isParsing.value = true
  const reader = new FileReader()
  
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      
      const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
      
      if (rawJson.length < 2) {
        throw new Error('File không có dữ liệu hoặc không đúng định dạng')
      }

      // Vòng qua headers (dòng 1)
      const rawHeaders = rawJson[0] as string[]
      headers.value = rawHeaders.filter(h => !!h).map(h => h.trim())

      // Valid headers (check missing required columns by their Vietnamese UI name)
      const missingHeaders = props.requiredColumns.filter(req => !headers.value.includes(req))
      if (missingHeaders.length > 0) {
        throw new Error(`Thiếu các cột bắt buộc: ${missingHeaders.join(', ')}`)
      }

      // Convert arrays of data into mapped Objects
      const bodyData = XLSX.utils.sheet_to_json(worksheet)
      
      const mappedData = bodyData.map((row: any) => {
        const item: Record<string, any> = {}
        for (const [uiKey, rawKey] of Object.entries(props.columnMapping)) {
           // Some parsers trim keys, sometimes not. We assume exact match from template
           if (row[uiKey] !== undefined) {
              item[rawKey] = row[uiKey]
           }
        }
        return item
      })

      parsedData.value = mappedData

    } catch (err: any) {
      errorMsg.value = err.message || 'Lỗi khi đọc file'
      selectedFile.value = null
      parsedData.value = []
    } finally {
      isParsing.value = false
    }
  }

  reader.onerror = () => {
    errorMsg.value = 'Lỗi không thể đọc file tĩnh'
    isParsing.value = false
  }

  reader.readAsArrayBuffer(file)
}

function downloadTemplate() {
    if (props.templateUrl) {
        window.open(props.templateUrl, '_blank');
    }
}

// Upload & Import Logic
async function handleImport() {
  if (!parsedData.value.length) return
  
  errorMsg.value = ''
  isUploading.value = true

  try {
    const payload = {
       [props.dataKey]: parsedData.value
    }
    
    const res: any = await $fetch(props.importApiUrl, {
      method: 'POST',
      body: payload
    })

    if (res && res.success) {
      importResults.value = res.results
      if (res.results.successCount > 0) {
          emit('success') // Refresh list outside
      }
    } else {
        throw new Error('Import thất bại từ máy chủ')
    }
  } catch (err: any) {
    errorMsg.value = err?.data?.message || err.message || 'Có lỗi xảy ra khi gọi API Import'
  } finally {
    isUploading.value = false
  }
}

const previewData = computed(() => {
   return parsedData.value.slice(0, 5) // Show only 5 rows max
})

</script>

<template>
  <AppDialog v-model="isOpen" :title="title" size="lg">
    <div class="import-container">
      
      <!-- Lỗi hiển thị chung -->
      <div v-if="errorMsg" class="error-banner">
        <svg viewBox="0 0 20 20" fill="currentColor" class="icon-sm"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
        <span>{{ errorMsg }}</span>
      </div>

      <!-- State: Results (bảng hiển thị tóm tắt cuối cùng) -->
      <div v-if="importResults" class="results-view">
          <div class="result-summary">
             <div class="stat success">
                <span class="stat-num">{{ importResults.successCount }}</span>
                <span class="stat-label">Thành công</span>
             </div>
             <div class="stat skipped">
                <span class="stat-num">{{ importResults.skippedCount }}</span>
                <span class="stat-label">Bỏ qua / Bị lỗi</span>
             </div>
          </div>
          
          <div v-if="importResults.errors && importResults.errors.length > 0" class="error-log">
             <h4>Chi tiết lỗi:</h4>
             <ul>
               <li v-for="(err, idx) in importResults.errors" :key="idx">{{ err }}</li>
             </ul>
          </div>

          <div class="actions center mt-6">
              <AppButton variant="primary" @click="isOpen = false">Hoàn tất</AppButton>
          </div>
      </div>

      <!-- State: Chưa có file hoặc sedang xem preview -->
      <div v-else>
         
         <div v-if="!selectedFile" class="initial-view">
             <p v-if="templateUrl" class="template-guide text-center mb-4">
                 Vui lòng tải <a href="#" @click.prevent="downloadTemplate" class="text-primary font-medium underline">File Mẫu (Template)</a> và điền dữ liệu trước khi tải lên.
             </p>
             
             <!-- Dropzone -->
             <div 
                class="dropzone" 
                :class="{ 'is-dragging': isDragging }"
                @dragover="onDragOver"
                @dragleave="onDragLeave"
                @drop="onDrop"
                @click="triggerFileSelect"
             >
                <div class="dropzone-content">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="icon-xl mb-3 text-muted"><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                    <h3 class="dropzone-title">Kéo thả file vào đây</h3>
                    <p class="dropzone-desc">hoặc click để chọn file từ máy (.csv, .xlsx)</p>
                </div>
                <input ref="fileInput" type="file" class="hidden" accept=".csv, .xls, .xlsx" @change="onFileSelected" />
             </div>
         </div>

         <!-- Preview View -->
         <div v-if="selectedFile && !isParsing" class="preview-view">
            <div class="file-summary">
               <div class="file-info">
                   <svg viewBox="0 0 24 24" fill="none" class="icon-md text-primary" stroke="currentColor" stroke-width="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                   <div class="file-text">
                       <p class="file-name">{{ selectedFile.name }}</p>
                       <p class="file-size">{{ Math.round(selectedFile.size / 1024) }} KB - {{ parsedData.length }} dòng dữ liệu hợp lệ</p>
                   </div>
               </div>
               <button class="btn-clear text-muted hover-error" @click="resetState" title="Huỷ bỏ file này">
                   <svg viewBox="0 0 20 20" fill="currentColor" class="icon-sm"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
               </button>
            </div>

            <!-- Table Preview -->
            <div v-if="parsedData.length" class="table-preview-wrapper mt-4">
                <p class="text-sm text-muted mb-2 font-medium">Bản xem trước ({{ previewData.length }} dòng đầu tiên)</p>
                <div class="table-container">
                    <table class="preview-table">
                        <thead>
                            <tr>
                                <th v-for="col in Object.keys(columnMapping)" :key="col">{{ col }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, i) in previewData" :key="i">
                                <td v-for="(rawKey, uiKey) in columnMapping" :key="uiKey">
                                    {{ row[rawKey] || '-' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="actions mt-6 flex justify-end gap-3">
                <AppButton variant="secondary" @click="isOpen = false" :disabled="isUploading">Huỷ bỏ</AppButton>
                <AppButton 
                   variant="primary" 
                   @click="handleImport" 
                   :loading="isUploading"
                   :disabled="!parsedData.length || isUploading">
                   Thực hiện Nhập dữ liệu
                </AppButton>
            </div>
         </div>

         <!-- Parsing Loader -->
         <div v-if="isParsing" class="flex flex-col items-center justify-center p-8">
            <svg class="animate-spin icon-xl text-primary mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4" opacity="0.25"/><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" opacity="0.75" /></svg>
            <p class="text-muted">Đang đọc file...</p>
         </div>

      </div>
    </div>
  </AppDialog>
</template>

<style scoped>
.import-container {
  padding: 0 var(--spacing-md);
}

.text-muted { color: var(--color-text-muted); }
.text-primary { color: var(--color-primary); }
.font-medium { font-weight: 500; }
.mb-2 { margin-bottom: var(--spacing-sm); }
.mb-3 { margin-bottom: var(--spacing-md); }
.mb-4 { margin-bottom: var(--spacing-lg); }
.mt-4 { margin-top: var(--spacing-lg); }
.mt-6 { margin-top: var(--spacing-2xl); }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-end { justify-content: flex-end; }
.gap-3 { gap: var(--spacing-md); }
.text-sm { font-size: var(--font-size-sm); }
.text-center { text-align: center; }
.hidden { display: none; }
.icon-sm { width: 16px; height: 16px; }
.icon-md { width: 24px; height: 24px; }
.icon-xl { width: 36px; height: 36px; }
.underline { text-decoration: underline; }
.hover-error:hover { color: var(--color-error); }

/* Error banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-sm);
}

/* Dropzone */
.dropzone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-xl);
  padding: 3rem 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: var(--color-bg-card);
  transition: all var(--transition-fast);
}
.dropzone:hover, .dropzone.is-dragging {
  border-color: var(--color-primary);
  background: var(--color-bg-primary);
}
.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.dropzone-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}
.dropzone-desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* File Info */
.file-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}
.file-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}
.file-name {
  font-weight: 600;
  font-size: var(--font-size-base);
}
.file-size {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
.btn-clear {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
}

/* Preview Table */
.table-container {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}
.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}
.preview-table th {
  background: var(--color-bg-card);
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}
.preview-table td {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.preview-table tr:last-child td {
  border-bottom: none;
}

/* Results View */
.result-summary {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}
.stat {
  flex: 1;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.stat-num {
  font-size: var(--font-size-3xl);
  font-weight: 800;
}
.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
.stat.success .stat-num { color: #10b981; } /* Green */
.stat.skipped .stat-num { color: var(--color-error); } 

.error-log {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  max-height: 200px;
  overflow-y: auto;
}
.error-log h4 {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-error);
  margin-bottom: var(--spacing-sm);
}
.error-log ul {
  list-style: disc;
  padding-left: 20px;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
.error-log li {
  margin-bottom: 4px;
}

.center { text-align: center; }
</style>
