<!-- src/components/ResultsDrawer/TooltipPortal.vue -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  tip: { type: Object, required: true }, // { show, text, color, side, top, left }
})

/** Derive a friendly title & dot color from tip.color */
const titleMap = {
  green:  'Green',
  yellow: 'Yellow',
  red:    'Red',
  grey:   'Grey',
}
const title = computed(() => titleMap[props.tip?.color] || '')

/** Optional: split text into shorter lines (no business logic change) */
const lines = computed(() => {
  const t = String(props.tip?.text || '').trim()
  // Keep it simple: split by '. ' but preserve the original if too short
  if (t.length < 80) return [t]
  // split on sentence-ish boundaries; filter empties; cap at 4
  return t.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 4)
})
</script>

<template>
  <teleport to="body">
    <div
      v-show="tip.show"
      id="global-green-tip"
      class="teleport-tip"
      :class="[tip.color, tip.side]"
      role="tooltip"
      aria-live="polite"
      :style="{ top: tip.top + 'px', left: tip.left + 'px' }"
    >
      <!-- Header -->
      <div class="tip-head">
        <span class="dot" :class="tip.color" aria-hidden="true"></span>
        <span class="tip-title">{{ title }}</span>
      </div>

      <!-- Body -->
      <div class="tip-body">
        <template v-if="lines.length > 1">
          <ul class="tip-list">
            <li v-for="(ln, i) in lines" :key="i">{{ ln }}</li>
          </ul>
        </template>
        <template v-else>
          <p class="tip-text">{{ tip.text }}</p>
        </template>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
/* Container (teleported to <body>) */
.teleport-tip {
  position: fixed;
  max-width: 420px;
  min-width: 240px;
  padding: .9rem 1rem .95rem;
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  line-height: 1.65;
  letter-spacing: .2px;
  border: 1px solid rgba(255,255,255,.14);
  box-shadow:
    0 14px 36px rgba(0,0,0,.45),
    inset 0 1px 0 rgba(255,255,255,.06);
  backdrop-filter: blur(10px);
  z-index: 9999;
  white-space: normal;
  /* subtle appear animation */
  transform: translateZ(0) scale(1);
  animation: tip-fade-in .18s ease-out;
}

/* Themes: slightly darker for better contrast */
.teleport-tip.green  { background: rgba(18, 110, 55, .96); }
.teleport-tip.yellow { background: rgba(135, 110, 14, .96); }
.teleport-tip.red    { background: rgba(164, 40, 40, .96); }
.teleport-tip.grey   { background: rgba(55, 62, 70, .96); }

/* Arrow (uses current background color) */
.teleport-tip::after {
  content: "";
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: 9px solid transparent;
}
.teleport-tip.left::after  { right: -9px; border-right-color: currentColor; }
.teleport-tip.right::after { left:  -9px; border-left-color:  currentColor; }

/* Because ::after uses currentColor, reset text color */
.teleport-tip.green,
.teleport-tip.yellow,
.teleport-tip.red,
.teleport-tip.grey { color: #fff; }

/* Header */
.tip-head {
  display: flex;
  align-items: center;
  gap: .5rem;
  margin-bottom: .45rem;
}
.tip-title {
  font-weight: 700;
  font-size: 14.5px;
  letter-spacing: .2px;
}
.dot {
  width: 10px; height: 10px; border-radius: 999px;
  box-shadow: inset 0 1px 1px rgba(255,255,255,.45), 0 0 0 1px rgba(255,255,255,.25);
}
.dot.green  { background: #16a34a; }
.dot.yellow { background: #ffd107; }
.dot.red    { background: #ef4444; }
.dot.grey   { background: #6b7280; }

/* Body */
.tip-body { margin-top: .1rem; }
.tip-text { margin: 0; }

.tip-list {
  margin: .1rem 0 0;
  padding-left: 1.05rem;
  display: grid;
  gap: .25rem;
}
.tip-list li {
  list-style: disc;
  opacity: .96;
}

/* Accessibility: improve yellow text readability on some screens */
.teleport-tip.yellow .tip-text,
.teleport-tip.yellow .tip-list { color: #fff; }

/* Keyframes */
@keyframes tip-fade-in {
  from { opacity: 0; transform: translateZ(0) scale(.98); }
  to   { opacity: 1; transform: translateZ(0) scale(1); }
}
</style>
