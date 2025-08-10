<script setup>
// Props and events
const props = defineProps({
  show: Boolean,
  loading: Boolean,
  errorMsg: String,
  results: { type: Array, default: () => [] },
  mapSearchUrl: { type: Function, required: true },
  mapDirectionsUrl: { type: Function, required: true }
})
const emit = defineEmits(['close'])
</script>

<template>
  <transition name="slide-panel">
    <aside v-if="props.show" class="slide-panel" aria-modal="true" role="dialog">
      <div class="slide-header">
        <button class="slide-back" @click="emit('close')">
          <i class="pi pi-arrow-left" style="margin-right:.4rem;"></i> Back
        </button>
        <h3 class="section-title" style="margin:0;">Top recommendations</h3>
      </div>

      <div class="slide-body">
        <div v-if="props.errorMsg" class="error-text" style="margin-bottom:.5rem;">{{ props.errorMsg }}</div>

        <template v-if="!props.loading && props.results.length">
          <ul class="result-list">
            <li v-for="r in props.results.slice(0,3)" :key="r.id" class="result-card">
              <div class="result-title">{{ r.title }}</div>
              <div v-if="r.postcode">Postcode: {{ r.postcode }}</div>
              <div v-if="r.day">Day: {{ r.day }}</div>
              <div v-if="r.hours">Hours: {{ r.hours }}</div>
              <div v-if="r.price">Price: {{ r.price }}</div>
              <div v-if="r.status">Status: {{ r.status }}</div>
              <div v-if="r.ts">Updated: {{ r.ts }}</div>

              <div class="map-actions">
                <a
                  :href="props.mapSearchUrl(r)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="map-chip"
                  title="Open in Google Maps"
                >
                  <i class="pi pi-map-marker" style="margin-right:.35rem;"></i> View map
                </a>
                <a
                  :href="props.mapDirectionsUrl(r)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="map-chip"
                  title="Directions"
                >
                  <i class="pi pi-directions" style="margin-right:.35rem;"></i> Directions
                </a>
              </div>
            </li>
          </ul>
        </template>

        <div v-else-if="!props.loading" class="summary">
          No matching spots for your selection.
        </div>
      </div>
    </aside>
  </transition>

  <transition name="fade">
    <div v-if="props.show" class="slide-overlay" @click="emit('close')" />
  </transition>
</template>

<style scoped>
/* Drawer frame kept exactly like before */
.slide-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: min(720px, 100%);
  height: 100%;
  background: rgba(0,0,0,.55);
  backdrop-filter: blur(6px);
  box-shadow: -8px 0 24px rgba(0,0,0,.35);
  z-index: 50;
  display: flex;
  flex-direction: column;
  padding: 1rem 1rem 1.2rem;
}
.slide-header { display: flex; align-items: center; gap: .8rem; margin-bottom: .6rem; }
.slide-back {
  display: inline-flex;
  align-items: center;
  padding: .4rem .8rem;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,.35);
  background: rgba(0,0,0,.25);
  color: #fff;
  cursor: pointer;
}
.slide-back:hover { background: rgba(0,0,0,.35); }
.slide-body { overflow-y: auto; padding: .2rem .2rem 0; }

/* Transitions */
.slide-panel-enter-from, .slide-panel-leave-to { transform: translateX(100%); }
.slide-panel-enter-active, .slide-panel-leave-active { transition: transform 360ms ease; }

/* Overlay that darkens and blurs the page behind */
.slide-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 40;
  backdrop-filter: blur(8px) saturate(0.9);
  -webkit-backdrop-filter: blur(8px) saturate(0.9);
}
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 240ms ease; }

/* Result list and cards kept with your classes */
.result-list { list-style: none; padding: 0; margin: 0; }
.result-card {
  margin: 8px 0;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
  color: #fff;
}
.result-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.75);
  transform: translateY(-1px);
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
}
.result-title { font-weight: 700; }

.map-actions { display: flex; gap: .5rem; margin: .4rem 0 .2rem; }
.map-chip {
  display: inline-flex; align-items: center;
  padding: .25rem .6rem; border-radius: 999px;
  background: rgba(255,255,255,.12);
  color: #e7f6ff; text-decoration: none; font-size: .85rem;
}
.map-chip:hover { background: rgba(255,255,255,.2); }

/* Reuse your summary and error styles for consistency */
.summary { color: #fff; }
.error-text { color: #ffd1d1; }
.section-title { margin: 1rem 0 0.5rem; }
</style>
