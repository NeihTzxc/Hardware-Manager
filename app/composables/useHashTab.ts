import { computed, onMounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'

/** Keeps a tab selection in the URL hash (for example: #history). */
export function useHashTab<T extends string>(
  defaultTab: T,
  validTabs: MaybeRefOrGetter<readonly T[]>
) {
  const route = useRoute()
  const router = useRouter()
  const tabIds = computed(() => toValue(validTabs))

  const getHashTab = () => {
    const hash = route.hash.slice(1)
    try {
      return decodeURIComponent(hash) as T
    } catch {
      return hash as T
    }
  }

  const isValidTab = (tab: T) => tabIds.value.includes(tab)
  const fallbackTab = () => tabIds.value[0] || defaultTab
  // A URL hash is not sent to the server. Start with the same tab during SSR
  // and client hydration, then restore the hash once hydration has completed.
  const activeTab = ref<T>(defaultTab)
  let isMounted = false

  const syncHash = async (tab: T) => {
    if (!isMounted || !isValidTab(tab) || route.hash === `#${tab}`) return

    await router.replace({
      path: route.path,
      query: route.query,
      hash: `#${encodeURIComponent(tab)}`
    })
  }

  const applyHashTab = () => {
    const hashTab = getHashTab()
    // Dynamic tabs can be unknown until their data has loaded; preserve a
    // supplied hash until the available tabs are known.
    if (hashTab && (isValidTab(hashTab) || tabIds.value.length === 0)) {
      activeTab.value = hashTab
    } else {
      activeTab.value = fallbackTab()
    }
  }

  watch(activeTab, syncHash)

  watch(() => route.hash, () => {
    if (isMounted) applyHashTab()
  })

  watch(tabIds, () => {
    if (isMounted) applyHashTab()
  })

  onMounted(() => {
    isMounted = true
    applyHashTab()
    syncHash(activeTab.value)
  })

  return activeTab
}
