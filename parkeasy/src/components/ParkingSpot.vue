<script setup>
import { ref, computed } from 'vue'

// PrimeVue components
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

// Form data
const selectedDay = ref(null)
const selectedTime = ref(null)
const postcode = ref('')

// Backend state for results
const loading = ref(false)
const errorMsg = ref('')
const results = ref([])

// Slide-in results page state
const showResults = ref(false)

// API base
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Day options for dropdown
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  .map(d => ({ label: d, value: d }))

// Time slot options for dropdown
const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour24 = i
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  const suffix = hour24 < 12 ? 'AM' : 'PM'
  return { label: `${hour12}:00 ${suffix}`, value: `${hour12}:00 ${suffix}` }
})

// Postcode validator
const isPostcodeValid = computed(() => /^\d{4}$/.test(postcode.value || ''))

// Normalize results for display
const normalizedResults = computed(() =>
  (results.value || []).map((r, i) => {
    const title = r.name ?? r.address ?? r.suburb ?? `Result #${i + 1}`
    const day = r.day ?? r.dayOfWeek ?? r.day_of_week ?? null
    const coords = (r.lat != null && r.lon != null) ? `${r.lat}, ${r.lon}` : null
    const hours = (r.start_hour != null && r.end_hour != null)
      ? `${r.start_hour}:00 - ${r.end_hour}:00`
      : null
    const price = (r.price_per_hour != null) ? `$${r.price_per_hour}/hr` : null
    const status = r.status ?? r.Status_Description ?? null
    const ts = r.statusTimestamp ?? r.Status_Timestamp ?? null
    return {
      id: r.id ?? i,
      title,
      postcode: r.postcode ?? '',
      day,
      coords,
      hours,
      price,
      status,
      ts
    }
  })
)

// Google Maps search link
const mapSearchUrl = (r) => {
  const q = r.title || r.coords || ''
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

// Google Maps directions link
const mapDirectionsUrl = (r) => {
  const dst = r.coords || r.title || ''
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dst)}`
}

// Submit handler
const handleSubmit = async () => {
  if (!selectedDay.value || !selectedTime.value || !postcode.value) {
    alert('Please complete all fields.')
    return
  }
  if (!isPostcodeValid.value) {
    alert('Postcode should be a 4-digit number, for example 3000.')
    return
  }

  loading.value = true
  errorMsg.value = ''
  results.value = []

  try {
    const resp = await fetch(`${API_BASE}/api/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day: selectedDay.value,
        time: selectedTime.value,
        postcode: postcode.value
      })
    })
    const data = await resp.json()
    if (!resp.ok) throw new Error(data?.error || 'Request failed')
    results.value = data?.results || []
    showResults.value = true
  } catch (e) {
    errorMsg.value = e.message || 'Network error'
    showResults.value = true
  } finally {
    loading.value = false
  }
}

const closeResults = () => { showResults.value = false }
</script>

<template>
  <div class="page-container">
    <!-- Branding section -->
    <div class="branding">
      <h1 class="brand-title">ParkEasy</h1>
      <h2 class="brand-subtitle">Find Your Spot, Stress-Free</h2>
      <p class="brand-description">
        In the bustling Melbourne CBD, finding a parking spot no longer needs to be stressful.
        ParkEasy uses smart recommendations to save you time, reduce congestion and carbon emissions,
        making every journey easier and more eco-friendly.
      </p>
    </div>

    <!-- Parking search form -->
    <div class="parking-form">
      <!-- Wrapper container to prevent style conflicts -->
      <div class="pv-fix">
        <!-- Select day -->
        <div class="form-group">
          <label for="day">Select a Day:</label>
          <Dropdown
            id="day"
            v-model="selectedDay"
            :options="days"
            optionLabel="label"
            optionValue="value"
            placeholder="-- Please choose a day --"
            class="w-full"
            :style="{ backgroundColor: 'white', borderColor: 'black' }"
          />
        </div>

        <!-- Select time -->
        <div class="form-group">
          <label for="time">Select a Time:</label>
          <Dropdown
            id="time"
            v-model="selectedTime"
            :options="timeSlots"
            optionLabel="label"
            optionValue="value"
            placeholder="-- Choose a time --"
            class="w-full"
            :disabled="!selectedDay"
            :style="{ backgroundColor: 'white', borderColor: 'black' }"
          />
        </div>

        <!-- Enter postcode -->
        <div class="form-group">
          <label for="postcode">Enter Postcode:</label>
          <InputText
            id="postcode"
            v-model="postcode"
            placeholder="e.g. 3000"
            class="w-full"
            :style="{ backgroundColor: 'white', borderColor: 'black' }"
          />
        </div>
      </div>

      <!-- Search button -->
      <div class="form-group">
        <Button
          label="Search Parking"
          icon="pi pi-search"
          class="w-full"
          @click="handleSubmit"
          :style="{ backgroundColor: 'black', borderColor: 'black', color: 'white' }"
          :disabled="loading"
        />
      </div>

      <!-- Loading and error messages -->
      <div v-if="loading">Searching...</div>
      <div v-if="errorMsg && !showResults" class="error-text">{{ errorMsg }}</div>

      <!-- Results list on the search page (only when not sliding) -->
      <div v-if="!showResults && !loading && normalizedResults.length">
        <h3 class="section-title">Top recommendations</h3>
        <ul class="result-list">
          <li
            v-for="r in normalizedResults.slice(0,3)"
            :key="r.id"
            class="result-card"
          >
            <div class="result-title">{{ r.title }}</div>
            <div v-if="r.postcode">Postcode: {{ r.postcode }}</div>
            <div v-if="r.day">Day: {{ r.day }}</div>
            <div v-if="r.hours">Hours: {{ r.hours }}</div>
            <div v-if="r.price">Price: {{ r.price }}</div>
            <div v-if="r.status">Status: {{ r.status }}</div>
            <div v-if="r.ts">Updated: {{ r.ts }}</div>

            <div class="map-actions">
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
        </ul>
      </div>

      <!-- Empty result hint -->
      <div v-if="!showResults && !loading && !normalizedResults.length && selectedDay && selectedTime && postcode" class="summary">
        No matching spots for your selection.
      </div>

      <!-- Summary -->
      <div v-if="selectedDay && selectedTime && postcode" class="summary">
        <p>
          You selected:
          <strong>{{ selectedDay }}</strong> at
          <strong>{{ selectedTime }}</strong>, Postcode:
          <strong>{{ postcode }}</strong>
        </p>
      </div>
    </div>

    <!-- Slide-in results panel -->
    <transition name="slide-panel">
      <aside v-if="showResults" class="slide-panel" aria-modal="true" role="dialog">
        <div class="slide-header">
          <button class="slide-back" @click="closeResults">
            <i class="pi pi-arrow-left" style="margin-right:.4rem;"></i> Back
          </button>
          <h3 class="section-title" style="margin:0;">Top recommendations</h3>
        </div>

        <div class="slide-body">
          <div v-if="errorMsg" class="error-text" style="margin-bottom:.5rem;">{{ errorMsg }}</div>

          <template v-if="!loading && normalizedResults.length">
            <ul class="result-list">
              <li
                v-for="r in normalizedResults.slice(0,3)"
                :key="r.id"
                class="result-card"
              >
                <div class="result-title">{{ r.title }}</div>
                <div v-if="r.postcode">Postcode: {{ r.postcode }}</div>
                <div v-if="r.day">Day: {{ r.day }}</div>
                <div v-if="r.hours">Hours: {{ r.hours }}</div>
                <div v-if="r.price">Price: {{ r.price }}</div>
                <div v-if="r.status">Status: {{ r.status }}</div>
                <div v-if="r.ts">Updated: {{ r.ts }}</div>

                <div class="map-actions">
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
            </ul>
          </template>

          <div v-else-if="!loading" class="summary">
            No matching spots for your selection.
          </div>
        </div>
      </aside>
    </transition>

    <!-- Dim overlay behind panel -->
    <transition name="fade">
      <div v-if="showResults" class="slide-overlay" @click="closeResults" />
    </transition>
  </div>
</template>

<style scoped>
.page-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: url("@/assets/background.jpg") no-repeat center center/cover;
  padding: 2rem;
  box-sizing: border-box;
  color: #fff;
  text-align: center;
}

.page-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 0;
}

.branding {
  position: relative;
  z-index: 1;
  margin-bottom: 2rem;
}

.brand-title {
  font-size: 3rem;
  font-weight: bold;
}

.brand-subtitle {
  font-size: 1.8rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

.brand-description {
  font-size: 1rem;
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
  color: white;
  line-height: 1.5;
}

.parking-form {
  position: relative;
  z-index: 1;
  max-width: 500px;
  width: 100%;
  padding: 2rem;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.form-group {
  margin-bottom: 1.2rem;
  text-align: left;
}

label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: block;
}

.summary {
  color: #fff;
}

.section-title {
  margin: 1rem 0 0.5rem;
}

.result-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-card {
  margin: 8px 0;
  padding: 12px;
  border-radius: 12px;
  background: rgba(0,0,0,.35);
  color: #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,.2);
}

.result-title {
  font-weight: 700;
}

.map-actions {
  display: flex;
  gap: .5rem;
  margin: .4rem 0 .2rem;
}

.map-chip {
  display: inline-flex;
  align-items: center;
  padding: .25rem .6rem;
  border-radius: 999px;
  background: rgba(255,255,255,.12);
  color: #e7f6ff;
  text-decoration: none;
  font-size: .85rem;
}

.map-chip:hover {
  background: rgba(255,255,255,.2);
}

.error-text {
  color: #ffd1d1;
}

/* Override PrimeVue styles only inside pv-fix */
:deep(.pv-fix .p-dropdown) {
  background: #fff !important;
  border: 1px solid #000 !important;
}
:deep(.pv-fix .p-dropdown .p-dropdown-label) {
  color: #000 !important;
}
:deep(.pv-fix .p-dropdown .p-dropdown-trigger) {
  color: #000 !important;
}
:deep(.pv-fix .p-inputtext) {
  color: #000 !important;
  background: #fff !important;
  border: 1px solid #000 !important;
}
:deep(.pv-fix .p-dropdown .p-placeholder),
:deep(.pv-fix .p-placeholder) {
  color: #666 !important;
}
:deep(.pv-fix .p-dropdown-panel) {
  background: #fff !important;
}
:deep(.pv-fix .p-dropdown-items .p-dropdown-item) {
  color: #000 !important;
}
:deep(.pv-fix .p-dropdown-items .p-dropdown-item.p-highlight) {
  background: rgba(0,0,0,0.06) !important;
  color: #000 !important;
}

/* New: slide-in panel and overlay. These classes are new and do not affect existing styles */
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

.slide-header {
  display: flex;
  align-items: center;
  gap: .8rem;
  margin-bottom: .6rem;
}
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

.slide-body {
  overflow-y: auto;
  padding: .2rem .2rem 0;
}

/* transitions */
.slide-panel-enter-from,
.slide-panel-leave-to { transform: translateX(100%); }
.slide-panel-enter-active,
.slide-panel-leave-active { transition: transform 360ms ease; }

.slide-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  z-index: 40;
}
.fade-enter-from,
.fade-leave-to { opacity: 0; }
.fade-enter-active,
.fade-leave-active { transition: opacity 240ms ease; }

/* White translucent frame for each result card */
.slide-panel .result-card,
.result-list .result-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
}

.slide-panel .result-card:hover,
.result-list .result-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.75);
  transform: translateY(-1px);
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.slide-panel .result-card .result-title,
.result-list .result-card .result-title {
  color: #fff;
}
</style>
