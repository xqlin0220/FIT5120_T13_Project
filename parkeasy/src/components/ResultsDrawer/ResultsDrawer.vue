<!-- src/components/ResultsDrawer/ResultsDrawer.vue -->
<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import ResultCard from './ResultCard.vue'
import HelpfulLinks from './HelpfulLinks.vue'
import TooltipPortal from './TooltipPortal.vue'
import { useGlobalTooltip } from './useGlobalTooltip'
import Explanation from './ExplanationRecommendation.vue'
defineProps({
  show: Boolean,
  loading: Boolean,
  errorMsg: String,
  results: { type: Array, default: () => [] },
  mapSearchUrl: { type: Function, required: true },
  mapDirectionsUrl: { type: Function, required: true }
})
const emit = defineEmits(['close'])

const links = [
  { label: 'City of Melbourne: Kerbside parking & fees', url: 'https://www.melbourne.vic.gov.au/kerbside-parking-and-fees' },
  { label: 'VicRoads: Parking rules', url: 'https://www.vicroads.vic.gov.au/safety-and-road-rules/road-rules/a-to-z-of-road-rules/parking%EF%BB%BF' },
  { label: 'City of Melbourne: Where to park', url: 'https://www.melbourne.vic.gov.au/where-to-park' },
  { label: 'Wilson Parking: Melbourne CBD', url: 'https://www.wilsonparking.com.au/parking-locations/victoria/melbourne-cbd/' },
  { label: 'Secure Parking: Melbourne rates', url: 'https://www.secureparking.com.au/en-au/car-park-rates/melbourne/' },
  { label: 'First Parking: Flat-rate', url: 'https://www.firstparking.com.au/' }
]

const legend = [
  { color: 'green',  desc: 'Excellent choice for eco-friendly travel: Right next to public transport, making it easy to walk, save time, and cut carbon emissions.' },
  { color: 'yellow', desc: 'Good choice for greener travel: A short walk to public transport, helping reduce driving and supporting a healthier lifestyle.' },
  { color: 'red',    desc: 'Less ideal for green travel: Far from public transport, likely requiring more driving and producing more emissions.' },
  { color: 'grey',   desc: 'Public transport access unknown: Location data is limited or unavailable.' }
]
const getGreenDesc = (color) => legend.find(i => i.color === color)?.desc || ''


const { tip, openFromEl, toggleFromEl, close, bindGlobalListeners } = useGlobalTooltip()
let unbind = null
onMounted(() => { unbind = bindGlobalListeners() })
onBeforeUnmount(() => { unbind && unbind() })
</script>

<template>
  <transition name="slide-panel">
    <aside v-if="show" class="slide-panel" aria-modal="true" role="dialog">
      <div class="slide-header">
        <button class="slide-back" @click="emit('close')">
          <i class="pi pi-arrow-left" style="margin-right:.4rem;"></i> Back
        </button>
        <h3 class="section-title" style="margin:0;">Top Recommendations</h3>
      </div>

      <div class="slide-body">
        <div v-if="errorMsg" class="error-text" style="margin-bottom:.5rem;">{{ errorMsg }}</div>

        <template v-if="!loading && results.length">
          <ul class="result-list">
            <ResultCard
              v-for="r in results.slice(0,3)"
              :key="r.id"
              :r="r"
              :mapSearchUrl="mapSearchUrl"
              :mapDirectionsUrl="mapDirectionsUrl"
              :getGreenDesc="getGreenDesc"
              :openFromEl="openFromEl"
              :toggleFromEl="toggleFromEl"
              :closeTip="close"
            />
          </ul>
        </template>

        <div v-else-if="!loading" class="summary">
          No matching spots for your selection.
        </div>

        <HelpfulLinks :links="links" />
        <Explanation
            :total="results.length"
            :collapsed="false"
            :criteria="[
                'Public transport accessibility (Green Decision score)',
                'Walkability to your destination (time/distance)',
                'Match with your filters (price, type, time window, etc.)',
                'Overall convenience (navigation/arrival efficiency, etc.)'
            ]"
        />
      </div>
    </aside>
  </transition>

  <transition name="fade">
    <div v-if="show" class="slide-overlay" @click="emit('close')" />
  </transition>

 
  <TooltipPortal :tip="tip" />
</template>

<style scoped>
/* Drawer / overlay / transitions */
.slide-panel {
  position: fixed; top: 0; right: 0; width: min(720px, 100%); height: 100%;
  background: rgba(0,0,0,.55); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  box-shadow: -8px 0 24px rgba(0,0,0,.35); z-index: 50; display: flex; flex-direction: column;
  padding: 1rem 1rem 1.2rem;
}
.slide-header { display: flex; align-items: center; gap: .8rem; margin-bottom: .6rem; }
.slide-back {
  display: inline-flex; align-items: center; padding: .4rem .8rem; border-radius: 999px;
  border: 1px solid rgba(255,255,255,.35); background: rgba(0,0,0,.25); color: #fff; cursor: pointer;
}
.slide-back:hover { background: rgba(0,0,0,.35); }
.slide-body { overflow-y: auto; padding: .2rem .2rem 0; }

.slide-panel-enter-from, .slide-panel-leave-to { transform: translateX(100%); }
.slide-panel-enter-active, .slide-panel-leave-active { transition: transform 360ms ease; }
.slide-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  z-index: 40; backdrop-filter: blur(8px) saturate(0.9); -webkit-backdrop-filter: blur(8px) saturate(0.9);
}
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 240ms ease; }

.result-list { list-style: none; padding: 0; margin: 0; }

.summary { color: #fff; }
.error-text { color: #ffd1d1; }
.section-title { margin: 1rem 0 0.5rem; }
</style>
