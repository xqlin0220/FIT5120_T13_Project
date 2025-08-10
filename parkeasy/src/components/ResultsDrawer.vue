<!-- src/components/ResultsDrawer.vue -->
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

// Helpful links data
const links = [
  { label: 'City of Melbourne: Kerbside parking & fees', url: 'https://www.melbourne.vic.gov.au/kerbside-parking-and-fees' },
  { label: 'VicRoads: Parking rules', url: 'https://www.vicroads.vic.gov.au/safety-and-road-rules/road-rules/a-to-z-of-road-rules/parking%EF%BB%BF' },
  { label: 'City of Melbourne: Where to park', url: 'https://www.melbourne.vic.gov.au/where-to-park' },
  { label: 'Wilson Parking: Melbourne CBD', url: 'https://www.wilsonparking.com.au/parking-locations/victoria/melbourne-cbd/' },
  { label: 'Secure Parking: Melbourne rates', url: 'https://www.secureparking.com.au/en-au/car-park-rates/melbourne/' },
  { label: 'First Parking: Flat-rate', url: 'https://www.firstparking.com.au/' }
]

// Collapsible state
import { ref } from 'vue'
const linksOpen = ref(false)
const toggleLinks = () => { linksOpen.value = !linksOpen.value }
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
        <!-- error message -->
        <div v-if="props.errorMsg" class="error-text" style="margin-bottom:.5rem;">{{ props.errorMsg }}</div>

        <!-- results -->
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

        <!-- empty state -->
        <div v-else-if="!props.loading" class="summary">
          No matching spots for your selection.
        </div>

        <!-- collapsible helpful links -->
        <div class="help-links">
          <button
            class="help-toggle"
            type="button"
            @click="toggleLinks"
            :aria-expanded="linksOpen ? 'true' : 'false'"
            aria-controls="help-links-panel"
          >
            <span class="help-title">
              <i class="pi pi-info-circle" style="margin-right:.4rem;"></i>
              Helpful Links
            </span>
            <i class="pi" :class="linksOpen ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
          </button>

          <transition name="collapse">
            <div v-show="linksOpen" id="help-links-panel">
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
        <!-- end collapsible -->
      </div>
    </aside>
  </transition>

  <transition name="fade">
    <div v-if="props.show" class="slide-overlay" @click="emit('close')" />
  </transition>
</template>

<style scoped>
/* Drawer frame */
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
  display: inline-flex; align-items: center;
  padding: .4rem .8rem; border-radius: 999px;
  border: 1px solid rgba(255,255,255,.35);
  background: rgba(0,0,0,.25); color: #fff; cursor: pointer;
}
.slide-back:hover { background: rgba(0,0,0,.35); }
.slide-body { overflow-y: auto; padding: .2rem .2rem 0; }

/* Transitions */
.slide-panel-enter-from, .slide-panel-leave-to { transform: translateX(100%); }
.slide-panel-enter-active, .slide-panel-leave-active { transition: transform 360ms ease; }
.slide-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  z-index: 40; backdrop-filter: blur(8px) saturate(0.9);
  -webkit-backdrop-filter: blur(8px) saturate(0.9);
}
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 240ms ease; }

/* Result cards */
.result-list { list-style: none; padding: 0; margin: 0; }
.result-card {
  margin: 8px 0; padding: 12px; border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px); color: #fff;
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

/* Helpful links */
.help-links {
  margin-top: 1.2rem;
  padding-left: 1rem;
}
.help-toggle {
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  padding: .6rem .8rem;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  transition: all .2s ease;
}
.help-toggle:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.6);
}
.help-title {
  font-size: 1rem; font-weight: 600; display: flex; align-items: center;
}
.help-list {
  list-style: none; padding: 0; margin: .6rem 0 0;
  display: grid; gap: .2rem;
}
.help-card {
  background: none;
  border: none;
  border-radius: 0;
  transition: none;
}
.help-card:hover {
  background: none;
  border-color:none;
  transform: none;
}
.help-link {
  display: flex; align-items: center;
  padding: .5rem .75rem;
  color: #e7f6ff; text-decoration: none;
  font-size: 0.85rem;
}
.help-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  transform: translateX(2px);
  text-decoration: underline;
  transition: all 0.18s ease;
}

/* Collapsible transition */
.collapse-enter-from, .collapse-leave-to {
  opacity: 0; max-height: 0; overflow: hidden;
}
.collapse-enter-active, .collapse-leave-active {
  transition: all 220ms ease;
}
.collapse-enter-to, .collapse-leave-from {
  opacity: 1; max-height: 600px; /* large enough to fit list */
}
.summary { color: #fff; }
.error-text { color: #ffd1d1; }
.section-title { margin: 1rem 0 0.5rem; }
</style>
