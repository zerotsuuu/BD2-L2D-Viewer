<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <nav class="flex items-center justify-between bg-black text-white p-4">
      <div class="text-xl md:text-3xl font-bold">Brown Dust 2 L2D Viewer</div>
      <div class="hidden md:flex items-center gap-4">
        <button class="cursor-pointer" @click="showUploadModal = true" title="Upload custom Spine model">
          <PlusIcon class="w-5 h-5 md:w-7 md:h-7" />
        </button>
        <button
          class="cursor-pointer"
          @click="openBackgroundModal(false)"
          aria-label="Upload background"
          title="Upload background image"
        >
          <BgUploadIcon class="w-5 h-5 md:w-7 md:h-7" />
        </button>
        <button
          v-if="hasCustomBackground"
          class="cursor-pointer opacity-70 hover:opacity-100 transition"
          @click="resetBackground"
          aria-label="Reset background"
          title="Reset background image"
        >
          <BgResetIcon class="w-5 h-5 md:w-7 md:h-7" />
        </button>
        <button class="cursor-pointer" @click="showChangelog = true" title="Changelog">
          <ChangelogIcon class="w-5 h-5 md:w-7 md:h-7" />
        </button>
        <a href="https://github.com/zerotsuuu/BD2-L2D-Viewer" target="_blank" title="Open GitHub repository">
          <GithubIcon class="w-5 h-5 md:w-7 md:h-7" />
        </a>
      </div>
      <button
        class="md:hidden cursor-pointer"
        @click="openMobileMenu()"
        aria-label="Menu"
      >
        <MenuIcon class="w-5 h-5" />
      </button>
    </nav>

    <div
      v-if="mobileMenuOpen"
      ref="mobileMenu"
      tabindex="-1"
      class="fixed inset-0 z-50 md:hidden bg-black bg-opacity-50"
    >
      <button
        class="absolute top-2 right-4 text-xl"
        @click="closeMobileMenu"
        aria-label="Close menu"
      >
        ✕
      </button>
      <div
        class="bg-black text-white w-60 p-4 flex flex-col gap-4 h-full"
      >
        <button
          class="flex items-center gap-2"
          @click="() => { showUploadModal = true; closeMobileMenu(); }"
        >
          <PlusIcon class="w-5 h-5" />
          <span>Upload</span>
        </button>
        <button
          class="flex items-center gap-2"
          @click="openBackgroundModal(true)"
        >
          <BgUploadIcon class="w-5 h-5" />
          <span>Upload Background</span>
        </button>
        <button
          v-if="hasCustomBackground"
          class="flex items-center gap-2"
          @click="() => { resetBackground(); closeMobileMenu(); }"
        >
          <BgResetIcon class="w-5 h-5 opacity-60" />
          <span>Reset Background</span>
        </button>
        <button
          class="flex items-center gap-2"
          @click="() => { showChangelog = true; closeMobileMenu(); }"
        >
          <ChangelogIcon class="w-5 h-5" />
          <span>Changelog</span>
        </button>
        <a
          href="https://github.com/zerotsuuu/BD2-L2D-Viewer"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-2"
          @click="closeMobileMenu"
        >
          <GithubIcon class="w-5 h-5" />
          <span>GitHub</span>
        </a>
      </div>
    </div>

    <UploadSpineModal v-if="showUploadModal" @close="showUploadModal = false" />
    <ChangelogModal v-if="showChangelog" @close="showChangelog = false" />
    <UploadBackgroundModal
      v-if="showBackgroundModal"
      :show-reset="hasCustomBackground"
      @close="showBackgroundModal = false"
      @upload-bg="handleBackgroundUpload"
      @reset-bg="handleBackgroundReset"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ChangelogModal from '@/components/ChangelogModal.vue'
import UploadSpineModal from '@/components/UploadSpineModal.vue'
import UploadBackgroundModal from '@/components/UploadBackgroundModal.vue'

import GithubIcon from '@/components/icons/GithubIcon.vue'
import ChangelogIcon from '@/components/icons/ChangelogIcon.vue'
import PlusIcon from '@/components/icons/PlusIcon.vue'
import MenuIcon from '@/components/icons/MenuIcon.vue'
import BgUploadIcon from '@/components/icons/BgUploadIcon.vue'
import BgResetIcon from '@/components/icons/BgResetIcon.vue'

const props = defineProps<{ hasCustomBackground?: boolean }>()
const hasCustomBackground = computed(() => !!props.hasCustomBackground)

const showChangelog = ref(false)
const showUploadModal = ref(false)
const showBackgroundModal = ref(false)
const mobileMenuOpen = ref(false)
const mobileMenu = ref<HTMLElement | null>(null)
let closeMenuAfterBgUpload = false


const emit = defineEmits<{
  (e: 'mobile-menu', open: boolean): void
  (e: 'upload-bg', dataUrl: string | null): void
  (e: 'overlay-active', active: boolean): void
}>()

const openMobileMenu = () => {
  mobileMenuOpen.value = true
  emit('mobile-menu', true)
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
  emit('mobile-menu', false)
}

const openBackgroundModal = (fromMobile: boolean) => {
  closeMenuAfterBgUpload = fromMobile
  if (fromMobile && mobileMenuOpen.value) {
    closeMobileMenu()
  }
  showBackgroundModal.value = true
}

const resetBackground = () => {
  closeMenuAfterBgUpload = false
  emit('upload-bg', null)
  showBackgroundModal.value = false
  if (mobileMenuOpen.value) {
    closeMobileMenu()
  }
}

const handleBackgroundUpload = (dataUrl: string | null) => {
  if (dataUrl) {
    emit('upload-bg', dataUrl)
  }
  if (closeMenuAfterBgUpload && mobileMenuOpen.value) {
    closeMobileMenu()
  }
  closeMenuAfterBgUpload = false
  showBackgroundModal.value = false
}

const handleBackgroundReset = () => {
  closeMenuAfterBgUpload = false
  emit('upload-bg', null)
  showBackgroundModal.value = false
}

watch(
  [showChangelog, showUploadModal, showBackgroundModal],
  () => {
    const active = showChangelog.value || showUploadModal.value || showBackgroundModal.value
    emit('overlay-active', active)
  },
  { immediate: true },
)

</script>






