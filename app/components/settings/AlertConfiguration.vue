<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppButton from '~/components/ui/AppButton.vue'
import AppFormControl from '~/components/ui/AppFormControl.vue'

const api = useApi()

const loading = ref(false)
const notificationMsg = ref<{ type: 'success' | 'error', text: string } | null>(null)

const form = ref({
  email: { active: false, host: '', port: 587, user: '', password: '', from: '' },
  slack: { active: false, webhookUrl: '' },
  telegram: { active: false, botToken: '', chatId: '' }
})

const fetchSettings = async () => {
  try {
    const data = await api<any>('/api/settings/alerts')
    if (data) Object.assign(form.value, data)
  } catch (error) {
    console.error('Lỗi tải cấu hình:', error)
  }
}

const saveSettings = async () => {
  loading.value = true
  notificationMsg.value = null
  try {
    await api('/api/settings/alerts', {
      method: 'PUT',
      body: form.value
    })
    notificationMsg.value = { type: 'success', text: 'Đã lưu cấu hình thông báo thành công!' }
    setTimeout(() => notificationMsg.value = null, 3000)
  } catch (error) {
    notificationMsg.value = { type: 'error', text: 'Lỗi khi lưu cấu hình, vui lòng thử lại.' }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<template>
  <div class="alerts-container fade-in">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Cấu hình Cảnh báo (Smart Notifications)</h2>
        <p class="page-subtitle">Cài đặt kênh gửi thông báo khi có sự kiện quan trọng.</p>
      </div>
      <AppButton label="Lưu cấu hình" variant="primary" icon="pi pi-check" :loading="loading" @click="saveSettings" />
    </div>

    <Transition name="fade">
      <div v-if="notificationMsg" :class="['alert-message', notificationMsg.type]">
        {{ notificationMsg.text }}
      </div>
    </Transition>

    <div class="cards-grid">
      <!-- Email Configuration -->
      <div class="info-card">
        <div class="card-header">
          <div class="header-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-icon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <h3 class="card-title">Email Notification (SMTP)</h3>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="form.email.active">
            <span class="slider"></span>
          </label>
        </div>

        <div v-if="form.email.active" class="form-grid">
          <AppFormControl label="SMTP Host">
            <input v-model="form.email.host" type="text" placeholder="smtp.gmail.com" />
          </AppFormControl>
          
          <AppFormControl label="SMTP Port">
            <input v-model="form.email.port" type="number" />
          </AppFormControl>

          <AppFormControl label="Username">
            <input v-model="form.email.user" type="text" placeholder="alert@yourdomain.com" />
          </AppFormControl>

          <AppFormControl label="Password">
            <input v-model="form.email.password" type="password" placeholder="••••••••" />
          </AppFormControl>
          
          <AppFormControl label="Sender Name/Email (From)" class="col-span-full">
            <input v-model="form.email.from" type="text" placeholder="Hardware Alerts <alert@yourdomain.com>" />
          </AppFormControl>
        </div>
        <div v-else class="empty-state-text">Gửi thông báo qua Email đang tắt. Bật lên để cấu hình.</div>
      </div>

      <!-- Slack Configuration -->
      <div class="info-card">
        <div class="card-header">
          <div class="header-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-icon"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
            <h3 class="card-title">Slack Webhook</h3>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="form.slack.active">
            <span class="slider"></span>
          </label>
        </div>

        <div v-if="form.slack.active" class="form-grid">
          <AppFormControl label="Webhook URL" class="col-span-full">
            <input v-model="form.slack.webhookUrl" type="text" placeholder="https://hooks.slack.com/services/..." />
          </AppFormControl>
        </div>
        <div v-else class="empty-state-text">Gửi thông báo qua Slack đang tắt. Bật lên để cấu hình.</div>
      </div>

      <!-- Telegram Configuration -->
      <div class="info-card">
        <div class="card-header">
          <div class="header-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-icon"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            <h3 class="card-title">Telegram Bot</h3>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" v-model="form.telegram.active">
            <span class="slider"></span>
          </label>
        </div>

        <div v-if="form.telegram.active" class="form-grid">
          <AppFormControl label="Bot Token" class="col-span-full">
            <input v-model="form.telegram.botToken" type="text" placeholder="123456789:ABCdefGHIjklMNO..." />
          </AppFormControl>
          <AppFormControl label="Chat ID / Group ID" class="col-span-full">
            <input v-model="form.telegram.chatId" type="text" placeholder="-1001234567890" />
          </AppFormControl>
        </div>
        <div v-else class="empty-state-text">Gửi thông báo qua Telegram đang tắt. Bật lên để cấu hình.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alerts-container {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.page-subtitle {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.alert-message {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.alert-message.success {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.alert-message.error {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.cards-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.info-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.info-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-md);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-icon {
  width: 24px;
  height: 24px;
  color: var(--color-accent);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
}

.empty-state-text {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
  padding: var(--spacing-md) 0;
  text-align: center;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md) var(--spacing-lg);
}

.col-span-full {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Toggle Switch Styling */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-bg-secondary);
  transition: .3s;
  border-radius: 24px;
  border: 1px solid var(--color-border);
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: var(--color-text-muted);
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: rgba(99, 102, 241, 0.15);
  border-color: var(--color-accent);
}

input:checked + .slider:before {
  transform: translateX(22px);
  background-color: var(--color-accent);
}

input:focus-visible + .slider {
  box-shadow: 0 0 0 2px var(--color-accent-light);
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
