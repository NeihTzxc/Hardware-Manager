<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useLayoutStore } from '~/stores/layout'

const route = useRoute()
const authStore = useAuthStore()
const layoutStore = useLayoutStore()

const emit = defineEmits(['logout'])

const navItems = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    to: '/dashboard',
  },
  {
    label: 'Quản lý thiết bị',
    icon: 'devices',
    to: '/devices',
  },
  {
    label: 'Quản lý danh mục',
    icon: 'categories',
    to: '/categories',
  },
  {
    label: 'Linh kiện',
    icon: 'components',
    to: '/components',
  },
  {
    label: 'Phụ kiện',
    icon: 'accessories',
    to: '/accessories',
  },
  {
    label: 'Quản lý mượn trả',
    icon: 'assignments',
    to: '/assignments',
  },
  {
    label: 'Biểu mẫu in',
    icon: 'print-templates',
    to: '/print-templates',
  },
  {
    label: 'Cài đặt',
    icon: 'settings',
    to: '/settings',
  },
  {
    label: 'Lịch sử hoạt động',
    icon: 'audit-logs',
    to: '/audit-logs',
  },
]

const isMobileOpen = ref(false)

function toggleSidebar() {
  layoutStore.toggleSidebar()
}

function toggleMobile() {
  isMobileOpen.value = !isMobileOpen.value
}

function closeMobile() {
  isMobileOpen.value = false
}

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <!-- Mobile hamburger button -->
  <button class="mobile-menu-btn" @click="toggleMobile" aria-label="Toggle menu">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path v-if="!isMobileOpen" d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
      <path v-else d="M6 6l12 12M6 18L18 6" stroke-linecap="round" />
    </svg>
  </button>

  <!-- Mobile overlay -->
  <Transition name="overlay-fade">
    <div v-if="isMobileOpen" class="sidebar-overlay" @click="closeMobile" />
  </Transition>

  <!-- Sidebar -->
  <aside
    class="sidebar"
    :class="{ collapsed: layoutStore.isSidebarCollapsed, 'mobile-open': isMobileOpen }"
  >
    <!-- User Profile Section -->
    <div class="sidebar-header">
      <div class="user-profile" :class="{ 'collapsed-profile': layoutStore.isSidebarCollapsed }">
        <div class="user-avatar">
          <ClientOnly>
            <span class="avatar-initials">{{ authStore.initials }}</span>
            <template #fallback>
              <span class="avatar-initials">?</span>
            </template>
          </ClientOnly>
        </div>
        <Transition name="fade-text">
          <div v-if="!layoutStore.isSidebarCollapsed" class="user-info">
            <ClientOnly>
              <div class="user-name-row">
                <span class="user-name">{{ authStore.displayName }}</span>
                <span
                  v-if="authStore.user?.role"
                  class="role-badge"
                  :class="authStore.user.role === 'ADMIN' ? 'role-admin' : 'role-user'"
                >
                  {{ authStore.user.role === 'ADMIN' ? 'Admin' : 'User' }}
                </span>
              </div>
              <span class="user-email">{{ authStore.user?.email }}</span>
              <template #fallback>
                <div class="user-name-row">
                  <span class="user-name">Đang tải...</span>
                </div>
              </template>
            </ClientOnly>
          </div>
        </Transition>
      </div>

      <!-- Collapse toggle (desktop) -->
      <button class="collapse-btn" @click="toggleSidebar" :aria-label="layoutStore.isSidebarCollapsed ? 'Mở rộng sidebar' : 'Thu nhỏ sidebar'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path v-if="!layoutStore.isSidebarCollapsed" d="M15 18l-6-6 6-6" />
          <path v-else d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li v-for="item in navItems" :key="item.to" class="nav-item">
          <NuxtLink
            :to="item.to"
            class="nav-link"
            :class="{ active: isActive(item.to) }"
            @click="closeMobile"
          >
            <div class="nav-icon">
              <!-- Dashboard -->
              <svg v-if="item.icon === 'dashboard'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
              <!-- Devices -->
              <svg v-else-if="item.icon === 'devices'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              <!-- Categories -->
              <svg v-else-if="item.icon === 'categories'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              <!-- Components (chip/circuit) -->
              <svg v-else-if="item.icon === 'components'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
                <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
              </svg>
              <!-- Accessories (package/box) -->
              <svg v-else-if="item.icon === 'accessories'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <!-- Assignments -->
              <svg v-else-if="item.icon === 'assignments'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              <!-- Print Templates -->
              <svg v-else-if="item.icon === 'print-templates'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <!-- Settings -->
              <svg v-else-if="item.icon === 'settings'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
              <!-- Audit Logs (history/clock) -->
              <svg v-else-if="item.icon === 'audit-logs'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <Transition name="fade-text">
              <span v-if="!layoutStore.isSidebarCollapsed" class="nav-label">{{ item.label }}</span>
            </Transition>

            <!-- Active indicator -->
            <div v-if="isActive(item.to)" class="active-indicator" />
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Footer / User section -->
    <div class="sidebar-footer">
      <div class="sidebar-divider" />
      <button class="nav-link logout-btn" @click="emit('logout')">
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </div>
        <Transition name="fade-text">
          <span v-if="!layoutStore.isSidebarCollapsed" class="nav-label">Đăng xuất</span>
        </Transition>
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* ===== Sidebar Container ===== */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 260px;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width var(--transition-base);
  overflow: hidden;
}

.sidebar.collapsed {
  width: 76px;
}

/* ===== Header / User Profile ===== */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-md);
  min-height: 72px;
  position: relative;
}

.collapsed .sidebar-header {
  flex-direction: column;
  padding: var(--spacing-md) 0;
  gap: var(--spacing-sm);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  overflow: hidden;
  flex: 1;
  min-width: 0;
}

.collapsed-profile {
  justify-content: center;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.35);
  transition: box-shadow var(--transition-fast);
}

.user-avatar:hover {
  box-shadow: 0 0 18px rgba(99, 102, 241, 0.5);
}

.avatar-initials {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
  line-height: 1;
  user-select: none;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 2px;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-badge {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  white-space: nowrap;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  line-height: 1.4;
  flex-shrink: 0;
}

.role-admin {
  background: rgba(168, 85, 247, 0.2);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.role-user {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.user-email {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.collapse-btn svg {
  width: 18px;
  height: 18px;
}

/* ===== Navigation ===== */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm) var(--spacing-md);
}

.nav-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 10px 12px;
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
  overflow: hidden;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.nav-link:hover {
  background: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.nav-link.active {
  background: var(--color-accent-light);
  color: var(--color-accent-hover);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.nav-icon svg {
  width: 22px;
  height: 22px;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
}

/* Active indicator bar */
.active-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: linear-gradient(180deg, var(--color-gradient-start), var(--color-gradient-end));
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

/* ===== Footer ===== */
.sidebar-footer {
  padding: var(--spacing-md);
}

.sidebar-divider {
  height: 1px;
  background: var(--color-border);
  margin-bottom: var(--spacing-md);
}

.logout-btn {
  font-family: inherit;
}

.logout-btn:hover {
  color: var(--color-error) !important;
  background: rgba(239, 68, 68, 0.1);
}

/* ===== Transitions ===== */
.fade-text-enter-active {
  transition: opacity 0.2s ease 0.05s;
}
.fade-text-leave-active {
  transition: opacity 0.1s ease;
}
.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* ===== Mobile ===== */
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: var(--spacing-md);
  left: var(--spacing-md);
  z-index: 150;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  cursor: pointer;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.mobile-menu-btn svg {
  width: 22px;
  height: 22px;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 90;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
  }

  .sidebar-overlay {
    display: block;
  }

  .sidebar {
    transform: translateX(-100%);
    width: 280px;
    box-shadow: var(--shadow-lg);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar.collapsed {
    width: 280px;
  }

  .collapse-btn {
    display: none;
  }
}
</style>
