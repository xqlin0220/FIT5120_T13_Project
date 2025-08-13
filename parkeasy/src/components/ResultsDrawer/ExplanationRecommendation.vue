<!-- src/components/ResultsDrawer/explanation.vue -->
<script setup>
import { ref } from 'vue'

const props = defineProps({
  /** Total match count shown in the note line */
  total: { type: Number, default: 0 },
  /** Collapse the section by default */
  collapsed: { type: Boolean, default: false },
  /** Ranking criteria (override to customize) */
  criteria: {
    type: Array,
    default: () => [
      'Public transport accessibility (Green Decision score)',
      'Walkability to your destination (time/distance)',
      'Match with your filters (price, type, time window, etc.)',
      'Overall convenience (navigation & arrival)'
    ]
  },
  /** Section title */
  title: { type: String, default: 'Why only the Top 3?' }
})

const open = ref(!props.collapsed)
</script>

<template>
  <div class="help-links">
    <!-- Header: exactly the same look & feel as Helpful Links -->
    <button
      class="help-toggle"
      type="button"
      @click="open = !open"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="explanation-panel"
    >
      <span class="help-title">
        <i class="pi pi-info-circle" style="margin-right:.4rem;"></i>
        {{ title }}
      </span>
      <i class="pi" :class="open ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
    </button>

    <!-- Body -->
    <transition name="collapse">
      <div v-show="open" id="explanation-panel" class="about-panel">
        <p class="about-intro">
          To help you decide faster, we rank all matches and highlight the three most relevant.
          This keeps the drawer quick to scan while the full list stays available on the map.
        </p>

        <div class="about-subtitle">How we rank</div>
        <ul class="why-list">
          <li v-for="(c, i) in criteria" :key="i">
            <i class="pi pi-check" aria-hidden="true" style="margin-right:.45rem;"></i>
            <span v-html="c" />
          </li>
        </ul>

        <p class="about-note">
          You can still view all <strong class="about-total">{{ total }}</strong> matches on the map.
        </p>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Header visuals copied from HelpfulLinks for perfect alignment */
.help-links { margin-top: 1.2rem; padding-left: 1rem; }
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

/* Collapse transition (same name as HelpfulLinks) */
.collapse-enter-from, .collapse-leave-to {
  opacity: 0; max-height: 0; overflow: hidden;
}
.collapse-enter-active, .collapse-leave-active {
  transition: all 220ms ease;
}
.collapse-enter-to, .collapse-leave-from {
  opacity: 1; max-height: 600px;
}

/* Body content styling (readable & tidy) */
.about-panel { padding: .6rem .8rem .8rem; text-align: left; }
.about-intro { margin: .2rem 0 .55rem; color: rgba(255,255,255,.92); }
.about-subtitle {
  margin: 0 0 .35rem;
  font-weight: 700;
  font-size: .95rem;
  color: #fff;
  opacity: .95;
}
.why-list {
  margin: 0 0 .4rem;
  padding-left: 0;
  list-style: none;
  display: grid;
  gap: .3rem;
  color: rgba(255,255,255,.92);
}
.why-list li { display: flex; align-items: flex-start; }
.about-note { margin: .35rem 0 0; color: rgba(255,255,255,.82); font-size: .9rem; text-align: center; }
.about-total { font-weight: 700; }
</style>
