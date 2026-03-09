<script setup lang="ts">
definePageMeta({ 
  layout: 'dashboard',
  middleware: 'auth'
})
</script>

<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Quản lý mượn trả</h1>
        <p class="page-subtitle">Theo dõi lịch sử cấp phát và thu hồi thiết bị</p>
      </div>
    </div>

    <div class="empty-state">
      <div class="empty-state-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      </div>
      <h3 class="empty-state-title">Chưa có lịch sử mượn trả</h3>
      <p class="empty-state-desc">Trang quản lý mượn trả sẽ được phát triển tiếp.</p>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  max-width: 1200px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-2xl);
}
.page-title {
  font-size: var(--font-size-3xl);
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--spacing-xs);
}
.page-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
  background: var(--color-bg-card);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-xl);
  min-height: 300px;
  text-align: center;
}
.empty-state-icon {
  width: 56px;
  height: 56px;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-lg);
}
.empty-state-icon svg {
  width: 100%;
  height: 100%;
}
.empty-state-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}
.empty-state-desc {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
