<script setup>
import { ref } from 'vue'

// PrimeVue  components
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'


const selectedDay = ref(null)
const selectedTime = ref(null)
const postcode = ref('')


const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']


const timeSlots = Array.from({ length: 26 }, (_, i) => {
  const hour = i % 12 === 0 ? 12 : i % 12
  const suffix = i < 12 ? 'AM' : 'PM'
  return `${hour} ${suffix}`
})


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
    <!-- left part of page -->
    <div class="left-side">
  <img src="@/assets/Zim_8.webp" alt="Background" class="side-image" />
  <h2 class="form-title">Melbourne CBD Parking Recommendation</h2>
</div>

    <!-- right part of page -->
    <div class="right-side">
      <div class="parking-form">
        <!-- Days -->
        <div class="form-group">
          <label for="day">Select a Day:</label>
          <Dropdown
            id="day"
            v-model="selectedDay"
            :options="days"
            placeholder="-- Please choose a day --"
            class="w-full"
            :style="{ backgroundColor: 'white', borderColor: 'black', color: 'white' }"
          />
        </div>

        <!-- time slot -->
        <div v-if="selectedDay" class="form-group">
          <label for="time">Select a Time:</label>
          <Dropdown
            id="time"
            v-model="selectedTime"
            :options="timeSlots"
            placeholder="-- Choose a time --"
            class="w-full"
            :style="{ backgroundColor: 'white', borderColor: 'black', color: 'white' }"
          />
        </div>

        <!-- Postcode -->
        <div class="form-group">
          <label for="postcode">Enter Postcode:</label>
          <InputText
            id="postcode"
            v-model="postcode"
            placeholder="e.g. 3000"
            class="w-full"
            :style="{ backgroundColor: 'white', borderColor: 'black', color: 'white' }"
          />
        </div>

        <!-- button for searching -->
        <div class="form-group">
          <Button
            label="Search Parking"
            icon="pi pi-search"
            class="w-full"
            @click="handleSubmit"
            :style="{ backgroundColor: 'black', borderColor: 'black', color: 'white' }"
          />
        </div>

        
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
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden; 
}
</style>

<style scoped>
.page-container {
  display: flex;
  height: 100vh;
  
}

/* Left part */
.left-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(to top right, #000000, #000000d2);
  position: relative;
}


.side-image {
  height: 60%;
  max-width: 80%;
  margin-bottom: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}



.form-title {
  position: absolute;
  bottom: 7rem; 
  left: 50%;
  transform: translateX(-50%);
  color: yellow;
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
}

/* right part */
.right-side {
  flex: 1;
  background: linear-gradient(to top left, #020202, #020202d8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.parking-form {
  max-width: 500px;
  width: 100%;
  padding: 2rem;
  border-radius: 12px;
  background-color: var(--surface-card);
  box-shadow: var(--shadow-4);
  color: var(--text-color);
  font-family: var(--font-family);
}

.form-group {
  margin-bottom: 1.2rem;
  color: #ffffff;
}

.summary {
  margin-top: 1rem;
  font-size: 1rem;
  color: var(--text-color-secondary, #f5f4f4);
}
</style>
