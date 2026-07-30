<script setup lang="ts">
import AppButton from '~/components/ui/AppButton.vue'
import ArrowLeftIcon from '~/components/ui/icons/ArrowLeftIcon.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const api = useApi()
const { success, error: notifyError } = useNotification()
const authStore = useAuthStore()

const loading = ref(true)
const ticket = ref<any>(null)
const comments = ref<any[]>([])
const newComment = ref('')
const isInternalNote = ref(false)

const submittingStatus = ref(false)
const submittingComment = ref(false)

async function fetchTicket() {
  try {
    const data = await api<{ success: boolean; ticket: any }>(`/api/tickets/${route.params.id}`)
    ticket.value = data.ticket
  } catch (err: any) {
    notifyError('Lỗi', err.data?.message || 'Không thể lấy thông tin yêu cầu.')
    router.push('/tickets')
  }
}

async function fetchComments() {
  try {
    const data = await api<{ success: boolean; comments: any[] }>(`/api/tickets/${route.params.id}/comments`)
    comments.value = data.comments
  } catch (err) {
    console.error(err)
  }
}

async function loadData() {
  loading.value = true
  await Promise.all([fetchTicket(), fetchComments()])
  loading.value = false
}

async function handleAddComment() {
  if (!newComment.value.trim()) return

  submittingComment.value = true
  try {
    const data = await api<{ success: boolean; comment: any }>(`/api/tickets/${route.params.id}/comments`, {
      method: 'POST',
      body: { 
        content: newComment.value, 
        isInternal: isInternalNote.value 
      }
    })
    
    if (data.success) {
      comments.value.push(data.comment)
      newComment.value = ''
      isInternalNote.value = false
      success('Thành công', 'Đã thêm bình luận.')
    }
  } catch (err: any) {
    notifyError('Lỗi', err.data?.message || 'Không thể gửi bình luận.')
  } finally {
    submittingComment.value = false
  }
}

async function handleUpdateStatus(newStatus: string) {
  if (!newStatus || newStatus === ticket.value.status) return

  submittingStatus.value = true
  try {
    const data = await api<{ success: boolean; ticket: any }>(`/api/tickets/${route.params.id}`, {
      method: 'PUT',
      body: { status: newStatus }
    })
    if (data.success) {
      ticket.value.status = newStatus
      fetchComments() // fetch to get the auto-generated comment
      success('Thành công', 'Đã cập nhật trạng thái.')
    }
  } catch (err: any) {
    notifyError('Lỗi', err.data?.message || 'Lỗi khi cập nhật trạng thái.')
  } finally {
    submittingStatus.value = false
  }
}

onMounted(() => {
  loadData()
})

const isAdmin = computed(() => authStore.user?.role === 'ADMIN')

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    OPEN: 'Mở',
    IN_PROGRESS: 'Đang xử lý',
    RESOLVED: 'Đã giải quyết',
    CLOSED: 'Đã đóng'
  }
  return labels[status] || status
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    HARDWARE_REQUEST: 'Yêu cầu Thiết bị',
    HARDWARE_ISSUE: 'Lỗi Thiết bị',
    SOFTWARE_REQUEST: 'Yêu cầu Phần mềm',
    SOFTWARE_ISSUE: 'Lỗi Phần mềm',
    OTHER: 'Khác'
  }
  return labels[type] || type
}

const getPriorityLabel = (p: string) => {
  const labels: Record<string, string> = {
    LOW: 'Thấp',
    MEDIUM: 'Trung bình',
    HIGH: 'Cao',
    URGENT: 'Khẩn cấp'
  }
  return labels[p] || p
}
</script>

<template>
  <div class="page-container wide fade-in">
    <div v-if="loading" class="loading-container">
      <div class="spinner-simple"></div>
      <p>Đang tải chi tiết...</p>
    </div>

    <template v-else-if="ticket">
      <div class="flex items-center gap-4 mb-6">
        <button class="back-btn" @click="router.push('/tickets')" aria-label="Quay lại">
          <ArrowLeftIcon :size="20" />
        </button>
        <div>
           <div class="flex items-center gap-3">
             <h1 class="page-title">{{ ticket.title }}</h1>
             <span :class="['status-badge', `status-${ticket.status.toLowerCase()}`]">
               {{ getStatusLabel(ticket.status) }}
             </span>
             <span :class="['priority-badge', `priority-${ticket.priority.toLowerCase()}`]">
               {{ getPriorityLabel(ticket.priority) }}
             </span>
           </div>
           <p class="text-sm text-gray-500 mt-1 font-mono">ID: {{ ticket.id }} • Tạo bởi {{ ticket.requester?.name || ticket.requester?.email }} vào {{ new Date(ticket.createdAt).toLocaleString('vi-VN') }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content Column -->
        <div class="lg:col-span-2 space-y-6">
          
          <div class="card p-6 bg-white rounded-xl border border-gray-200">
            <h3 class="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Nội dung yêu cầu</h3>
            <div class="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {{ ticket.description }}
            </div>
            
            <div v-if="ticket.device" class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-4 cursor-pointer hover:bg-gray-100 transition" @click="router.push(`/devices/${ticket.device.id}`)">
               <div class="bg-blue-100 text-blue-600 p-2 rounded-lg">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
               </div>
               <div>
                 <p class="text-sm text-gray-500 font-medium">Thiết bị liên quan</p>
                 <p class="font-bold text-gray-800">{{ ticket.device.name }} ({{ ticket.device.serialNumber || 'Không có serial' }})</p>
               </div>
            </div>
          </div>

          <!-- Timeline / Comments -->
          <div class="card p-6 bg-white rounded-xl border border-gray-200">
            <h3 class="text-lg font-semibold mb-6 text-gray-800 border-b pb-2">Lịch sử & Thảo luận</h3>
            
            <div class="space-y-6 mb-8">
               <div v-if="comments.length === 0" class="text-center text-gray-400 py-4 italic">
                  Chưa có bình luận nào.
               </div>
               
               <div v-for="comment in comments" :key="comment.id" class="flex gap-4">
                  <div class="flex-shrink-0 mt-1">
                    <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                       {{ comment.author?.name?.charAt(0).toUpperCase() || '?' }}
                    </div>
                  </div>
                  <div class="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100" :class="{'ring-2 ring-yellow-200 bg-yellow-50': comment.isInternal}">
                     <div class="flex justify-between items-center mb-2">
                        <span class="font-semibold text-gray-800 text-sm">
                           {{ comment.author?.name || 'Unknown' }}
                           <span v-if="comment.isInternal" class="ml-2 text-xs font-bold text-yellow-600 uppercase bg-yellow-100 px-2 py-0.5 rounded">Ghi chú nội bộ</span>
                        </span>
                        <span class="text-xs text-gray-400">{{ new Date(comment.createdAt).toLocaleString('vi-VN') }}</span>
                     </div>
                     <p class="text-gray-700 text-sm whitespace-pre-wrap">{{ comment.content }}</p>
                  </div>
               </div>
            </div>

            <!-- Add Comment -->
            <div class="mt-6 border-t pt-6">
              <AppFormControl label="Thêm bình luận" id="comment">
                <textarea v-model="newComment" id="comment" rows="3" placeholder="Nhập bình luận của bạn..." class="w-full"></textarea>
              </AppFormControl>
              <div class="flex justify-between items-center mt-3">
                 <div v-if="isAdmin">
                   <label class="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                     <input type="checkbox" v-model="isInternalNote" class="rounded text-indigo-600 focus:ring-indigo-500">
                     Chỉ admin mới xem được (Ghi chú nội bộ)
                   </label>
                 </div>
                 <div v-else></div>
                 <AppButton label="Gửi" variant="primary" :loading="submittingComment" @click="handleAddComment" :disabled="!newComment.trim()" />
              </div>
            </div>

          </div>
        </div>

        <!-- Sidebar Column -->
        <div class="space-y-6">
          <div class="card p-6 bg-white rounded-xl border border-gray-200">
             <h3 class="font-semibold mb-4 text-gray-800">Thông tin chi tiết</h3>
             <div class="space-y-4">
                <div>
                   <p class="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Loại yêu cầu</p>
                   <p class="text-gray-800 font-medium">{{ getTypeLabel(ticket.type) }}</p>
                </div>
                <!-- Status Update for Admin -->
                <div v-if="isAdmin">
                   <p class="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Trạng thái</p>
                   <select :value="ticket.status" @change="(e) => handleUpdateStatus((e.target as HTMLSelectElement).value)" class="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none transition">
                     <option value="OPEN">Mở</option>
                     <option value="IN_PROGRESS">Đang xử lý</option>
                     <option value="RESOLVED">Đã giải quyết</option>
                     <option value="CLOSED">Đã đóng</option>
                   </select>
                </div>
                <div v-else>
                   <p class="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Trạng thái</p>
                   <p class="text-gray-800 font-medium">{{ getStatusLabel(ticket.status) }}</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<style scoped>
.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  margin: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.back-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
  transform: translateX(-2px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px;
  gap: var(--spacing-md);
  color: var(--color-text-muted);
}

.spinner-simple {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.1);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.status-open {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

.status-in_progress {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
}

.status-resolved {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}

.status-closed {
  background: rgba(107, 114, 128, 0.1);
  color: #9ca3af;
}

/* Priority Badges */
.priority-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.priority-low {
  background: rgba(107, 114, 128, 0.1);
  color: #9ca3af;
}

.priority-medium {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

.priority-high {
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
}

.priority-urgent {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

textarea {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 12px;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
  outline: none;
  resize: vertical;
}

textarea:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
</style>
