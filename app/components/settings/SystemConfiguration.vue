<script setup lang="ts">
import { ref } from 'vue'
import SunIcon from '~/components/ui/icons/SunIcon.vue'
import MoonIcon from '~/components/ui/icons/MoonIcon.vue'
import MonitorIcon from '~/components/ui/icons/MonitorIcon.vue'
import DataReset from '~/components/settings/DataReset.vue'

const colorMode = useColorMode()

// Options for theme selection
const options = [
  {
    value: 'light',
    label: 'Sáng',
    desc: 'Giao diện sáng rõ ràng, tối ưu cho ban ngày.',
    icon: SunIcon
  },
  {
    value: 'dark',
    label: 'Tối',
    desc: 'Giao diện tối dịu mắt, hoàn hảo cho ban đêm.',
    icon: MoonIcon
  },
  {
    value: 'system',
    label: 'Hệ thống',
    desc: 'Tự động đồng bộ theo cấu hình của thiết bị.',
    icon: MonitorIcon
  }
]

const selectTheme = (value: string) => {
  colorMode.preference = value
}
</script>

<template>
  <div class="system-settings-container fade-in">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Cấu hình Hệ thống</h2>
        <p class="page-subtitle">Tùy chỉnh các thiết lập hiển thị và vận hành của hệ thống.</p>
      </div>
    </div>

    <!-- Theme Config Card -->
    <div class="info-card">
      <div class="card-header">
        <div class="header-left">
          <SunIcon class="section-icon" />
          <h3 class="card-title">Chủ đề giao diện (Theme Preference)</h3>
        </div>
      </div>

      <p class="section-description">
        Thay đổi giao diện màu sắc của ứng dụng phù hợp với môi trường làm việc của bạn.
      </p>

      <div class="theme-grid">
        <button
          v-for="opt in options"
          :key="opt.value"
          class="theme-card"
          :class="{ active: colorMode.preference === opt.value }"
          @click="selectTheme(opt.value)"
        >
          <!-- Active check icon -->
          <div class="active-badge" v-if="colorMode.preference === opt.value">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div class="theme-card-icon">
            <component :is="opt.icon" />
          </div>
          <div class="theme-card-content">
            <h4 class="theme-card-title">{{ opt.label }}</h4>
            <p class="theme-card-desc">{{ opt.desc }}</p>
          </div>
        </button>
      </div>
    </div>

    <DataReset />
  </div>
</template>

<style scoped>
.system-settings-container {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
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

/* Light mode card border hover adjustments */
:global(html.light) .info-card:hover,
:global(html.light-mode) .info-card:hover {
  border-color: rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-md);
  margin-bottom: var(--spacing-md);
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

.section-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xl);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

@media (max-width: 768px) {
  .theme-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}

.theme-card {
  position: relative;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
  outline: none;
  font-family: inherit;
  width: 100%;
}

.theme-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-accent);
  box-shadow: var(--shadow-md);
  background: var(--color-surface-hover);
}

.theme-card.active {
  border-color: var(--color-accent);
  background: var(--color-accent-light);
  box-shadow: var(--shadow-glow);
}

/* Light mode specific background hover override for active theme card */
:global(html.light) .theme-card.active,
:global(html.light-mode) .theme-card.active {
  background: rgba(79, 70, 229, 0.08);
}

.active-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.theme-card-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
  transition: all var(--transition-base);
}

.theme-card:hover .theme-card-icon,
.theme-card.active .theme-card-icon {
  background: var(--color-accent);
  color: white;
}

.theme-card-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.theme-card-title {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--color-text-primary);
}

.theme-card-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  line-height: 1.4;
}

.fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
