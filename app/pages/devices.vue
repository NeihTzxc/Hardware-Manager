<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <div class="page-container fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Quản lý thiết bị</h1>
        <p class="page-subtitle">Theo dõi và quản lý tất cả thiết bị trong công ty</p>
      </div>
    </div>

    <div class="empty-state">
      <div class="empty-state-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      </div>
      <h3 class="empty-state-title">Chưa có thiết bị nào</h3>
      <p class="empty-state-desc">Trang quản lý thiết bị sẽ được phát triển tiếp.</p>
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
