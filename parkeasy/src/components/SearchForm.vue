<script setup>
/**
 * PrimeVue Components Imports
 * - Dropdown: for day and time selection
 * - InputText: for entering postcode
 * - Button: for search action
 */
import Dropdown from 'primevue/dropdown'
import { computed } from 'vue'
import Button from 'primevue/button'

/**
 * Props received from parent
 * - selectedDay: currently chosen day value
 * - selectedTime: currently chosen time slot value
 * - postcode: entered postcode
 * - days: available day options
 * - timeSlots: available time slot options (depends on selected day)
 * - loading: indicates if search is in progress
 * - errorMsg: error message text to display
 */
const props = defineProps({
  selectedDay: String,
  selectedTime: String,
  selectedPostcode: String,
  postcodes: { type: Array, default: () => [] },
  days: { type: Array, default: () => [] },
  timeSlots: { type: Array, default: () => [] },
  loading: Boolean,
  errorMsg: String
})

/**
 * Emits to notify parent of changes or actions
 * - update:selectedDay: triggered when day changes
 * - update:selectedTime: triggered when time changes
 * - update:postcode: triggered when postcode changes
 * - submit: triggered when search button is clicked
 */
const emit = defineEmits([
  'update:selectedDay',
  'update:selectedTime',
  'update:selectedPostcode',
  'submit'
])

const canSearch = computed(() =>
  !!props.selectedDay &&
  !!props.selectedTime &&
  !!props.selectedPostcode &&
  !props.loading
)
</script>

<template>
  <div class="parking-form">
    <div class="pv-fix">
      <div class="form-group">
        <label for="day">Select a working day:</label>
        <Dropdown
          id="day"
          :modelValue="props.selectedDay"
          @update:modelValue="val => emit('update:selectedDay', val)"
          :options="props.days"
          optionLabel="label"
          optionValue="value"
          placeholder="-- Please choose a day --"
          class="w-full"
          :style="{ backgroundColor: 'white', borderColor: 'black' }"
        />
      </div>

      <div class="form-group">
        <label for="time">Select an approx. arrival time:</label>
        <Dropdown
          id="time"
          :modelValue="props.selectedTime"
          @update:modelValue="val => emit('update:selectedTime', val)"
          :options="props.timeSlots"
          optionLabel="label"
          optionValue="value"
          placeholder="-- Choose your approx. arrival time --"
          class="w-full"
          :disabled="!props.selectedDay"
          :style="{ backgroundColor: 'white', borderColor: 'black' }"
        />
      </div>

      <div class="form-group">
        <label for="postcode">Choose a city postcode:</label>
        <Dropdown
          id="postcode"
          :modelValue="props.selectedPostcode"
          @update:modelValue="val => emit('update:selectedPostcode', val)"
          :options="props.postcodes"
          optionLabel="label"
          optionValue="value"
          placeholder="-- Select a postcode --"
          class="w-full"
          :style="{ backgroundColor: 'white', borderColor: 'black' }"
        />
      </div>
    </div>

    <div class="form-group">
      <Button
        label="Search Parking"
        icon="pi pi-search"
        class="w-full search-btn"
        :disabled="!canSearch"
        @click="emit('submit')"
      />
    </div>

    <div v-if="props.loading">Searching...</div>
    <div v-if="props.errorMsg" class="error-text">{{ props.errorMsg }}</div>

    <slot name="summary" />
  </div>
</template>

<style scoped>
/* Keep original card look for the form */
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
.form-group { margin-bottom: 1.2rem; text-align: left; }
label { font-weight: bold; margin-bottom: 0.5rem; display: block; }
.error-text { color: #ffd1d1; }

/* PrimeVue overrides limited to pv-fix container */
:deep(.pv-fix .p-dropdown) {
  background: #fff !important;
  border: 1px solid #000 !important;
}
:deep(.pv-fix .p-dropdown .p-dropdown-label) { color: #000 !important; }
:deep(.pv-fix .p-dropdown .p-dropdown-trigger) { color: #000 !important; }
:deep(.pv-fix .p-inputtext) {
  color: #000 !important;
  background: #fff !important;
  border: 1px solid #000 !important;
}
:deep(.pv-fix .p-dropdown .p-placeholder),
:deep(.pv-fix .p-placeholder) { color: #666 !important; }
:deep(.pv-fix .p-dropdown-panel) { background: #fff !important; }
:deep(.pv-fix .p-dropdown-items .p-dropdown-item) { color: #000 !important; }
:deep(.pv-fix .p-dropdown-items .p-dropdown-item.p-highlight) {
  background: rgba(0,0,0,0.06) !important;
  color: #000 !important;
}
:deep(.search-btn) {
  background-color: #bbb !important;
  border-color: #bbb !important;
  color: #000 !important;
  transition: background-color 0.2s ease;
}

:deep(.search-btn:hover:not(.p-disabled)) {
  background-color: #aaa !important;
  border-color: #aaa !important;
}

:deep(.search-btn.p-disabled) {
  background-color: #ddd !important;
  border-color: #ddd !important;
  color: #888 !important;
}
</style>
