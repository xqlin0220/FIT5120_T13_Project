<!-- src/components/ResultsDrawer/ResultCard.vue -->
<script setup>
const {
  r,
  mapSearchUrl,
  mapDirectionsUrl,
  getGreenDesc,
  openFromEl,
  toggleFromEl,
  closeTip
} = defineProps({
  r: { type: Object, required: true },
  mapSearchUrl: { type: Function, required: true },
  mapDirectionsUrl: { type: Function, required: true },
  getGreenDesc: { type: Function, required: true },
  openFromEl: { type: Function, required: true },
  toggleFromEl: { type: Function, required: true },
  closeTip: { type: Function, required: true },
})
</script>

<template>
  <li class="result-card" tabindex="0" role="button">
    <div class="result-title-row">
      <div class="result-title">{{ r.title }}</div>
    </div>

    <div class="map-actions">
      <span
        v-if="r.green"
        class="pill has-tip"
        :class="r.green.color"
        role="button"
        tabindex="0"
        @mouseenter="openFromEl({ el: $event.currentTarget, text: getGreenDesc(r.green.color), color: r.green.color })"
        @mouseleave="closeTip()"
        @focus="openFromEl({ el: $event.currentTarget, text: getGreenDesc(r.green.color), color: r.green.color })"
        @blur="closeTip()"
        @click.stop="toggleFromEl({ el: $event.currentTarget, text: getGreenDesc(r.green.color), color: r.green.color })"
      >
        {{ r.green.label }}
      </span>

      <a
        :href="mapSearchUrl(r)"
        target="_blank"
        rel="noopener noreferrer"
        class="map-chip"
        title="Open in Google Maps"
      >
        <i class="pi pi-map-marker" style="margin-right:.35rem;"></i> View map
      </a>
      <a
        :href="mapDirectionsUrl(r)"
        target="_blank"
        rel="noopener noreferrer"
        class="map-chip"
        title="Directions"
      >
        <i class="pi pi-directions" style="margin-right:.35rem;"></i> Directions
      </a>
    </div>
  </li>
</template>

<style scoped>
.result-card {
  position: relative;
  margin: 8px 0; padding: 12px; border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px); color: #fff;
  overflow: visible;
}
.result-card:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateX(2px);
  transition: all 0.18s ease;
}
.result-title { font-weight: 700; }

.map-actions {
  display: flex; gap: .5rem; margin: .4rem 0 .2rem;
  position: relative; overflow: visible;
}
.map-chip {
  display: inline-flex; align-items: center;
  padding: .25rem .6rem; border-radius: 999px;
  background: rgba(255,255,255,.12);
  color: #e7f6ff; text-decoration: none; font-size: .85rem;
}
.map-chip:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateX(2px);
  transition: all 0.18s ease;
}

/* pill */
.pill {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.6;
  color: #fff;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.25),
              inset 0 -1px 2px rgba(0, 0, 0, 0.15),
              0 1px 2px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: default;
}
.pill.green  { background-color: rgba(7, 238, 92, 0.863); }
.pill.yellow { background-color: rgb(255, 217, 0); color: #222; }
.pill.red    { background-color: rgb(239, 68, 68); }
.pill.grey   { background-color: rgb(107, 114, 128); }
</style>
