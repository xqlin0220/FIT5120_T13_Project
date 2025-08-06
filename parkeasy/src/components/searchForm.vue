<template>
  <div class="bg-white/20 border border-white/30 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl">
    <h1 class="text-4xl font-bold mb-2 text-center text-purple-700">PARKEASY</h1>
    <h2 class="text-md mb-4 text-center font-medium">by UrbanMind LabX</h2>
    <p class="mb-8 text-center text-gray-700">
      UrbanMind LabX is committed to enhancing smart mobility in urban environments.<br />
      PARKEASY helps you quickly find the best parking spots near your destination.
    </p>

    <!-- Form -->
    <div class="md:col-span-2">
        <label class="block font-medium mb-1">Date</label>
        <input
            v-model="selectedDate"
            type="date"
            class="w-[280px] rounded-xl p-2 bg-white/60 border border-gray-300"
        />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block font-medium mb-1">Day</label>
        <select v-model="selectedDay" class="w-full rounded-xl p-2 bg-white/60 border border-gray-300">
          <option disabled value="">Please select</option>
          <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
        </select>
      </div>
      <div>
        <label class="block font-medium mb-1">Time Slot</label>
        <select v-model="selectedTime" class="w-full rounded-xl p-2 bg-white/60 border border-gray-300">
          <option disabled value="">Please select</option>
          <option v-for="time in times" :key="time" :value="time">{{ time }}</option>
        </select>
      </div>
      <div class="md:col-span-2">
        <label class="block font-medium mb-1">Destination Postcode</label>
        <input
          v-model="postcode"
          type="text"
          class="w-full rounded-xl p-2 bg-white/60 border border-gray-300"
          placeholder="e.g. 3000"
        />
      </div>
    </div>

    <!-- Button -->
    <div class="flex justify-center mt-6">
      <button
        @click="searchParking"
        class="bg-purple-400/80 hover:bg-purple-500 text-white px-6 py-2 rounded-full shadow-md backdrop-blur transition"
      >
        Search Parking
      </button>
    </div>

    <!-- Results -->
    <div
      v-if="showResults"
      class="mt-8 bg-white/20 border border-white/30 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl"
    >
      <h2 class="text-xl font-semibold mb-4 text-center">Search Results</h2>
      <ul>
        <li v-for="(result, index) in parkingResults" :key="index" class="mb-2">
          {{ result.name }} - {{ result.address }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedDay = ref('')
const selectedTime = ref('')
const postcode = ref('')
const showResults = ref(false)
const parkingResults = ref([])
const selectedDate = ref('')

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const times = Array.from({ length: 24 }, (_, i) => {
  const pad = (n) => n.toString().padStart(2, '0')
  const start = `${pad(i)}:00`
  const end = `${pad((i + 1) % 24)}:00`
  return `${start}-${end}`
})

function searchParking() {
  if (selectedDay.value && selectedTime.value && postcode.value) {
    parkingResults.value = [
      { name: 'City Parking Lot A', address: `${postcode.value} Collins St` },
      { name: 'Secure Parking B', address: `${postcode.value} Swanston St` },
      { name: 'Underground Parking C', address: `${postcode.value} Bourke St` }
    ]
    showResults.value = true
  } else {
    alert('Please complete all fields before searching.')
  }
}
</script>