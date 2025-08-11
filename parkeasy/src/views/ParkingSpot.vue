<script setup>
// State and computed
import { ref, computed } from 'vue'

// Children
import SearchForm from '@/components/SearchForm.vue'
import ResultsDrawer from '@/components/ResultsDrawer.vue'

// PrimeVue is used inside children, no need here

// Form data
const selectedDay = ref(null)
const selectedTime = ref(null)
const postcode = ref('')

// Backend state
const loading = ref(false)
const errorMsg = ref('')
const results = ref([])

// Drawer state
const showResults = ref(false)

// API base
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Options for dropdowns
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  .map(d => ({ label: d, value: d }))

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour24 = i
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  const suffix = hour24 < 12 ? 'AM' : 'PM'
  return { label: `${hour12}:00 ${suffix}`, value: `${hour12}:00 ${suffix}` }
})

// Normalized results used by drawer and inline states
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
      ts,
      green: r.green || null,                // { label, color }
      nearestStop: r.nearestStop || null     // { name, distance_m, ... }
    }
  })
)


// Map links
const mapSearchUrl = (r) => {
  const q = r.title || r.coords || ''
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}
const mapDirectionsUrl = (r) => {
  const dst = r.coords || r.title || ''
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dst)}`
}

// Submit handler invoked by SearchForm
const handleSubmit = async () => {
  if (!selectedDay.value || !selectedTime.value || !postcode.value) {
    alert('Please complete all fields.')
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
    <!-- Branding block keeps original look -->
    <div class="branding">
      <h1 class="brand-title">ParkEasy</h1>
      <h2 class="brand-subtitle">Find Your Spot, Stress-Free</h2>
      <p class="brand-description">
        In the bustling Melbourne CBD, finding a parking spot no longer needs to be stressful.
        ParkEasy uses smart recommendations to save you time, reduce congestion and carbon emissions,
        making every journey easier and more eco-friendly.
      </p>
    </div>

    <!-- Search form component, passes down current values and options -->
    <SearchForm
      v-model:selectedDay="selectedDay"
      v-model:selectedTime="selectedTime"
      v-model:postcode="postcode"
      :days="days"
      :timeSlots="timeSlots"
      :loading="loading"
      :errorMsg="!showResults ? errorMsg : ''"
      @submit="handleSubmit"
    >
      <template #summary>
        <div v-if="selectedDay && selectedTime && postcode" class="summary">
          You selected: <strong>{{ selectedDay }}</strong> at
          <strong>{{ selectedTime }}</strong>, Postcode: <strong>{{ postcode }}</strong>
        </div>
      </template>
    </SearchForm>

    <!-- Slide-in drawer for results -->
    <ResultsDrawer
      :show="showResults"
      :loading="loading"
      :errorMsg="errorMsg"
      :results="normalizedResults"
      :mapSearchUrl="mapSearchUrl"
      :mapDirectionsUrl="mapDirectionsUrl"
      @close="closeResults"
    />
  </div>
</template>

<style scoped>
/* Page background and global layout kept exactly as before */
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
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 0;
}

.branding { position: relative; z-index: 1; margin-bottom: 2rem; }
.brand-title { font-size: 3rem; font-weight: bold; }
.brand-subtitle { font-size: 1.8rem; font-weight: 500; margin-top: 0.5rem; }
.brand-description { font-size: 1rem; max-width: 680px; margin: 0 auto; color: white; line-height: 1.5; word-break: keep-all; }

/* Summary style kept */
.summary { color: #fff; }
</style>
