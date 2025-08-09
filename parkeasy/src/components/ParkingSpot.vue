<script setup>
import { ref } from 'vue'

// PrimeVue components
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

// Form data
const selectedDay = ref(null)
const selectedTime = ref(null)
const postcode = ref('')

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

// Form submission handler
const handleSubmit = () => {
  if (!selectedDay.value || !selectedTime.value || !postcode.value) {
    alert('Please complete all fields.')
    return
  }
  console.log('Form submitted:', selectedDay.value, selectedTime.value, postcode.value)
}
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
          :style="{ backgroundColor: 'white', borderColor: 'black', color: 'black' }"
        />
      </div>

      <!-- Select time (always visible, disabled until day is selected) -->
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
          :style="{ backgroundColor: 'white', borderColor: 'black', color: 'black' }"
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
          :style="{ backgroundColor: 'white', borderColor: 'black', color: 'black' }"
        />
      </div>

      <!-- Search button -->
      <div class="form-group">
        <Button
          label="Search Parking"
          icon="pi pi-search"
          class="w-full"
          @click="handleSubmit"
          :style="{ backgroundColor: 'black', borderColor: 'black', color: 'white' }"
        />
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
  </div>
</template>

<style scoped>
/* Main container with background image and dark overlay */
.page-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: url("@/assets/Zim_8.webp") no-repeat center center/cover;
  padding: 2rem;
  box-sizing: border-box;
  color: #fff;
  text-align: center;
}

/* Dark semi-transparent overlay for better text readability */
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

/* Branding section styles */
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
  word-break: keep-all;
}

/* Parking form styles */
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
  color: #fff;
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
  margin-top: 1rem;
  font-size: 1rem;
  color: #f5f4f4;
}
</style>
