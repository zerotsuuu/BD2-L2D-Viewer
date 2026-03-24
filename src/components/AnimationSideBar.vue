<template>
  <div class="w-full lg:w-64 lg:h-full max-h-dvh lg:max-h-none overflow-hidden lg:overflow-visible bg-gray-800 text-white flex flex-col min-h-0">
    <div class="flex-1 min-h-0 px-2 flex flex-col gap-2">
      <div class="pt-2">
        <div class="inline-flex bg-gray-700/70 rounded-md p-1 gap-1">
          <button
            class="px-3 py-1 rounded text-sm transition-colors"
            :class="sidebarTab === 'controls' ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white'"
            @click="sidebarTab = 'controls'"
          >
            Controls
          </button>
          <button
            class="px-3 py-1 rounded text-sm transition-colors"
            :class="sidebarTab === 'layers' ? 'bg-gray-600 text-white' : 'text-gray-300 hover:text-white'"
            @click="sidebarTab = 'layers'"
          >
            Layers
          </button>
        </div>
      </div>
      <template v-if="sidebarTab === 'controls'">
        <div class="hidden lg:flex flex-col gap-2 min-h-0">
          <span>Skins</span>
          <select
            v-model="store.selectedSkin"
            class="bg-gray-700 text-white"
          >
            <option v-for="skin in skins" :key="skin" :value="skin">{{ skin }}</option>
          </select>
          <span>Animations</span>
          <div class="overflow-y-auto sidebar-scroll flex-1">
            <div
              v-for="name in animations"
              :key="name"
              class="py-2 pl-2 cursor-pointer"
              :class="{ 'bg-gray-700': name === selectedAnimation }"
              @click="select(name)"
            >
              {{ name }}
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <span>Layers</span>
        <input
          v-model="layerFilter"
          type="text"
          placeholder="Filter layers..."
          class="bg-gray-700 text-white rounded px-2 py-1 text-sm"
        />
        <div class="overflow-y-auto sidebar-scroll flex-1 min-h-0">
          <div v-if="!filteredLayerNames.length" class="text-sm text-gray-400 px-2 py-2">
            No layers found.
          </div>
          <label
            v-for="layer in filteredLayerNames"
            :key="layer"
            :ref="el => { if (layer === store.selectedLayer) selectedLayerEl = el as HTMLElement | null }"
            class="flex items-center gap-2 py-1 px-2 rounded cursor-pointer hover:bg-gray-700"
            :class="{ 'bg-indigo-600/50 ring-1 ring-indigo-400': layer === store.selectedLayer }"
            @click.self="store.selectedLayer = layer"
          >
            <input
              type="checkbox"
              :checked="isLayerVisible(layer)"
              @change="toggleLayer(layer)"
            />
            <span class="truncate" @click.self="store.selectedLayer = layer">{{ layer }}</span>
          </label>
        </div>
      </template>
    </div>
    <div class="lg:mt-auto flex flex-col">
      <div v-if="!currentChar?.customFiles" class="p-2">
        <span>Animation Category</span>
        <select v-model="store.animationCategory" class="bg-gray-700 text-white w-full">
          <option value="character">Character</option>
          <option value="ultimate" :disabled="!currentChar?.cutscene">Ultimate</option>
          <option value="dating" :disabled="!currentChar?.dating">Fated Guest</option>
        </select>
      </div>
      <div class="p-2">
        <span>Animation Speed</span>
        <div class="flex items-center gap-2">
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.05"
            v-model.number="store.animationSpeed"
            class="flex-1"
          />
          <span class="w-12 text-right">{{ store.animationSpeed.toFixed(2) }}x</span>
        </div>
      </div>
      <div class="p-2 gap-2 hidden lg:flex">
        <button
          class="bg-gray-600 hover:bg-gray-500 text-white rounded shadow transition px-4 py-2"
          @click="emit('reset-camera')"
        >
          Reset View
        </button>
        <button
          class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow transition px-4 py-2"
          @click="store.playing = !store.playing"
        >
          {{ toggleLabel }}
        </button>
      </div>
      <div class="p-2 flex">
        <button
          class="flex-1 bg-gray-600 hover:bg-gray-500 text-white rounded shadow transition px-4 py-2"
          @click="colorInput?.click()"
        >
          BG Color
        </button>
        <input
          ref="colorInput"
          type="color"
          class="hidden"
          @input="onColorChange"
        />
      </div>
      <div class="p-2 flex gap-2 items-center">
        <button
          class="flex-1 bg-gray-600 hover:bg-gray-500 text-white rounded shadow transition px-4 py-2"
          @click="onScreenshot"
          :disabled="screenshotting"
        >
          <LoadingIcon v-if="screenshotting" />
          <span v-else>Screenshot</span>
        </button>
        <label class="flex items-center gap-1 text-sm whitespace-nowrap">
          <input type="checkbox" v-model="transparentBg" />
          <span>Transparent<br />image/export</span>
        </label>
      </div>
      <div class="p-2 hidden md:flex relative" ref="desktopExportRef">
        <button
          class="flex-1 bg-gray-600 hover:bg-gray-500 text-white rounded shadow transition px-4 py-2"
          @click="showExportMenu = !showExportMenu"
          :disabled="exporting"
        >
          <LoadingIcon v-if="exporting" />
          <span v-else>Export Animation</span>
        </button>
        <div
          v-if="showExportMenu"
          class="absolute right-2 bottom-full mb-1 w-48 bg-gray-700 rounded shadow z-10"
        >
          <button
            class="block w-full text-left px-4 py-2 hover:bg-gray-600"
            @click="onExport('video')"
          >
            Export as WebM
          </button>
          <button
            class="block w-full text-left px-4 py-2 hover:bg-gray-600"
            @click="onExport('frames')"
          >
            Export as Frames (ZIP)
          </button>
        </div>
      </div>
      <div class="p-2 flex md:hidden relative" ref="mobileExportRef">
        <button
          class="flex-1 bg-gray-600 hover:bg-gray-500 text-white rounded shadow transition px-4 py-2"
          @click="showExportMenu = !showExportMenu"
          :disabled="exporting"
        >
          <LoadingIcon v-if="exporting" />
          <span v-else>Export Animation</span>
        </button>
        <div
          v-if="showExportMenu"
          class="absolute right-2 top-full mt-1 w-48 bg-gray-700 rounded shadow z-10"
        >
          <button
            class="block w-full text-left px-4 py-2 hover:bg-gray-600"
            @click="onExport('video')"
          >
            Export as WebM
          </button>
          <button
            class="block w-full text-left px-4 py-2 hover:bg-gray-600"
            @click="onExport('frames')"
          >
            Export as Frames (ZIP)
          </button>
        </div>
      </div>
      <div class="p-2">
        <label class="flex items-center gap-1 text-sm whitespace-nowrap">
          <input type="checkbox" v-model="store.useCurrentCamera" />
          <span>Use current camera in image/export</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useCharacterStore } from '@/stores/characterStore'

import LoadingIcon from '@/components/icons/LoadingIcon.vue';

const props = defineProps<{ animations: string[]; skins: string[]; exporting: boolean; screenshotting: boolean }>()
const { animations, skins, exporting, screenshotting } = toRefs(props)

const store = useCharacterStore()
const colorInput = ref<HTMLInputElement | null>(null)
const transparentBg = ref(false)
const showExportMenu = ref(false)
const desktopExportRef = ref<HTMLElement | null>(null)
const mobileExportRef = ref<HTMLElement | null>(null)
const sidebarTab = ref<'controls' | 'layers'>('controls')
const layerFilter = ref('')
const selectedLayerEl = ref<HTMLElement | null>(null)

const emit = defineEmits(['select', 'reset-camera', 'screenshot', 'export-animation', 'category-change'])

function select(name: string) {
  emit('select', name)
  store.selectedAnimation = name
}

function onColorChange(e: Event) {
  const input = e.target as HTMLInputElement
  store.backgroundColor = input.value
}

function onScreenshot() {
  emit('screenshot', transparentBg.value)
}

function onExport(format: 'video' | 'frames') {
  emit('export-animation', { format, transparent: transparentBg.value })
  showExportMenu.value = false
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (desktopExportRef.value?.contains(target) || mobileExportRef.value?.contains(target))
    return
  showExportMenu.value = false
}

const selectedAnimation = computed(() => store.selectedAnimation)
const toggleLabel = computed(() => (store.playing ? 'Pause' : 'Play'))
const currentChar = computed(() => store.characters.find(c => c.id === store.selectedCharacterId))
const layerNames = computed(() => [...store.layerNames].sort((a, b) => a.localeCompare(b)))
const filteredLayerNames = computed(() => {
  const query = layerFilter.value.trim().toLowerCase()
  if (!query) return layerNames.value
  return layerNames.value.filter(name => name.toLowerCase().includes(query))
})

function isLayerVisible(name: string) {
  const value = store.layerVisibility[name]
  return value !== false
}

function toggleLayer(name: string) {
  store.layerVisibility[name] = !isLayerVisible(name)
}

watch(() => store.selectedLayer, (layerName) => {
  if (!layerName) return
  sidebarTab.value = 'layers'
  nextTick(() => {
    selectedLayerEl.value?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })
})

watch(() => store.animationCategory, () => {
  emit('category-change');
});

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>
