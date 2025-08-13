<!-- src/components/ResultsDrawer/HelpfulLinks.vue -->
<script setup>
import { ref } from 'vue'
const { links } = defineProps({ links: { type: Array, required: true } })
const open = ref(false)
</script>

<template>
  <div class="help-links">
    <button
      class="help-toggle"
      type="button"
      @click="open = !open"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="help-links-panel"
    >
      <span class="help-title">
        <i class="pi pi-info-circle" style="margin-right:.4rem;"></i>
        Helpful Links
      </span>
      <i class="pi" :class="open ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
    </button>

    <transition name="collapse">
      <div v-show="open" id="help-links-panel">
        <ul class="help-list">
          <li v-for="link in links" :key="link.url" class="help-card">
            <a :href="link.url" target="_blank" rel="noopener" class="help-link">
              <i class="pi pi-external-link" style="margin-right:.5rem;"></i>
              {{ link.label }}
            </a>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.help-links { margin-top: 1.2rem; padding-left: 1rem; }
.help-toggle {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  padding: .6rem .8rem; background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.3); border-radius: 10px;
  color: #fff; cursor: pointer; transition: all .2s ease;
}
.help-toggle:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.6); }
.help-title { font-size: 1rem; font-weight: 600; display: flex; align-items: center; }
.help-list { list-style: none; padding: 0; margin: .6rem 0 0; display: grid; gap: .2rem; }
.help-card { background: none; border: none; border-radius: 0; transition: none; }
.help-link {
  display: flex; align-items: center; padding: .5rem .75rem;
  color: #e7f6ff; text-decoration: none; font-size: 0.85rem;
}
.help-link:hover {
  color: #fff; background: rgba(255, 255, 255, 0.18);
  border-radius: 6px; transform: translateX(2px); text-decoration: underline;
  transition: all 0.18s ease;
}
.collapse-enter-from, .collapse-leave-to { opacity: 0; max-height: 0; overflow: hidden; }
.collapse-enter-active, .collapse-leave-active { transition: all 220ms ease; }
.collapse-enter-to, .collapse-leave-from { opacity: 1; max-height: 600px; }
</style>
