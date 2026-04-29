<script setup>
import { ref, onMounted } from 'vue';
import { useActivitiesStore } from '../store/activities';
import { Plus, Edit2, Trash2, X } from 'lucide-vue-next';

const activitiesStore = useActivitiesStore();

const showModal = ref(false);
const editingId = ref(null);

const form = ref({
  type: 'Running',
  distance: '',
  duration: '',
  date: new Date().toISOString().slice(0, 10),
  note: ''
});

const activityTypes = ['Running', 'Cycling', 'Swimming', 'Walking', 'Weightlifting', 'Yoga', 'Other'];

onMounted(() => {
  activitiesStore.fetchActivities();
});

function resetForm() {
  form.value = {
    type: 'Running',
    distance: '',
    duration: '',
    date: new Date().toISOString().slice(0, 10),
    note: ''
  };
  editingId.value = null;
  showModal.value = false;
}

function openAdd() {
  resetForm();
  showModal.value = true;
}

function openEdit(act) {
  form.value = {
    type: act.type,
    distance: act.distance,
    duration: act.duration,
    date: act.date,
    note: act.note || ''
  };
  editingId.value = act._id;
  showModal.value = true;
}

async function saveActivity() {
  const payload = {
    type: form.value.type,
    date: form.value.date,
    duration: Number(form.value.duration),
    distance: Number(form.value.distance) || 0,
    note: form.value.note || ''
  };

  if (editingId.value) {
    await activitiesStore.updateActivity(editingId.value, payload);
  } else {
    await activitiesStore.addActivity(payload);
  }

  if (!activitiesStore.error) resetForm();
}

async function deleteActivity(id) {
  if (confirm('Are you sure you want to delete this activity?')) {
    await activitiesStore.deleteActivity(id);
  }
}
</script>

<template>
  <div class="container py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">Activities</h1>
        <p class="text-secondary">Track and manage your fitness journey</p>
      </div>
      <button @click="openAdd" class="btn btn-primary">
        <Plus class="w-4 h-4 mr-2" style="width: 16px; margin-right:8px" />
        Add Activity
      </button>
    </div>

    <!-- Error banner -->
    <div v-if="activitiesStore.error" class="error-banner mb-4">
      {{ activitiesStore.error }}
    </div>

    <!-- Activities Table -->
    <div class="card table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Duration (min)</th>
            <th>Distance (km)</th>
            <th>Note</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="activitiesStore.loading">
            <td colspan="6" class="p-8 text-center text-secondary">Loading…</td>
          </tr>

          <tr v-for="act in activitiesStore.activities" :key="act._id">
            <td class="font-medium">{{ act.date }}</td>
            <td>
              <span class="badge badge-primary">{{ act.type }}</span>
            </td>
            <td>{{ act.duration }}</td>
            <td>{{ act.distance || '-' }}</td>
            <td class="text-sm text-secondary">{{ act.note || '-' }}</td>
            <td class="text-right">
              <button @click="openEdit(act)" class="btn-icon mr-2" title="Edit">
                <Edit2 style="width: 16px; height: 16px" />
              </button>
              <button @click="deleteActivity(act._id)" class="btn-icon text-danger" title="Delete">
                <Trash2 style="width: 16px; height: 16px" />
              </button>
            </td>
          </tr>

          <tr v-if="!activitiesStore.loading && activitiesStore.activities.length === 0">
            <td colspan="6" class="p-8 text-center text-secondary">
              No activities found. Log your first workout!
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click.self="resetForm">
      <div class="modal slide-up-enter-active">
        <div class="card-header">
          <h2 class="card-title">{{ editingId ? 'Edit Activity' : 'Log Activity' }}</h2>
          <button @click="resetForm" class="btn-icon">
            <X style="width: 20px; height: 20px" />
          </button>
        </div>

        <div class="card-body">
          <form @submit.prevent="saveActivity">
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group col-span-2">
                <label class="form-label" for="type">Activity Type</label>
                <select v-model="form.type" id="type" class="form-control" required>
                  <option v-for="type in activityTypes" :key="type" :value="type">{{ type }}</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="date">Date</label>
                <input v-model="form.date" type="date" id="date" class="form-control" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="duration">Duration (minutes)</label>
                <input v-model="form.duration" type="number" id="duration" class="form-control" placeholder="45" required min="1">
              </div>

              <div class="form-group col-span-2">
                <label class="form-label" for="distance">Distance (km, optional)</label>
                <input v-model="form.distance" type="number" id="distance" class="form-control" placeholder="5.0" step="0.1" min="0">
              </div>

              <div class="form-group col-span-2">
                <label class="form-label" for="note">Note / Comments (optional)</label>
                <textarea v-model="form.note" id="note" class="form-control" rows="3" placeholder="How did it feel?"></textarea>
              </div>
            </div>

            <!-- API error inside modal -->
            <div v-if="activitiesStore.error" class="error-banner mt-2">
              {{ activitiesStore.error }}
            </div>

            <div class="mt-6 flex justify-end gap-2">
              <button type="button" @click="resetForm" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Activity</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-banner {
  background-color: rgba(229, 56, 59, 0.1);
  color: var(--danger);
  border: 1px solid var(--danger);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}
</style>
