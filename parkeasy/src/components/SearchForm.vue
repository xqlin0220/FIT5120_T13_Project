<script setup>
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const props = defineProps({
  selectedDay: String,
  selectedTime: String,
  postcode: String,
  days: { type: Array, default: () => [] },
  timeSlots: { type: Array, default: () => [] },
  loading: Boolean,
  errorMsg: String
})

const emit = defineEmits([
  'update:selectedDay',
  'update:selectedTime',
  'update:postcode',
  'submit'
])
</script>

<template>
  <div class="parking-form">
    <div class="pv-fix">
      <div class="form-group">
        <label for="day">Select a Day:</label>
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
        <label for="time">Select a Time:</label>
        <Dropdown
          id="time"
          :modelValue="props.selectedTime"
          @update:modelValue="val => emit('update:selectedTime', val)"
          :options="props.timeSlots"
          optionLabel="label"
          optionValue="value"
          placeholder="-- Choose a time --"
          class="w-full"
          :disabled="!props.selectedDay"
          :style="{ backgroundColor: 'white', borderColor: 'black' }"
        />
      </div>

      <div class="form-group">
        <label for="postcode">Enter Postcode:</label>
        <InputText
          id="postcode"
          :modelValue="props.postcode"
          @update:modelValue="val => emit('update:postcode', val)"
          placeholder="e.g. 3000"
          class="w-full"
          :style="{ backgroundColor: 'white', borderColor: 'black' }"
        />
      </div>
    </div>

    <div class="form-group">
      <Button
        label="Search Parking"
        icon="pi pi-search"
        class="w-full"
        :disabled="props.loading"
        :style="{ backgroundColor: 'black', borderColor: 'black', color: 'white' }"
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
</style>
