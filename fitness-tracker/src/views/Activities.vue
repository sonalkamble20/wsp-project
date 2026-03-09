<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../store/auth';
import { useActivitiesStore } from '../store/activities';
import { Plus, Edit2, Trash2, X } from 'lucide-vue-next';

const authStore = useAuthStore();
const activitiesStore = useActivitiesStore();

const activities = computed(() => activitiesStore.getUserActivities(authStore.currentUser.id));

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
  form.value = { ...act };
  editingId.value = act.id;
  showModal.value = true;
}

function saveActivity() {
  if (editingId.value) {
    activitiesStore.updateActivity(editingId.value, { ...form.value });
  } else {
    activitiesStore.addActivity({
      ...form.value,
      userId: authStore.currentUser.id
    });
  }
  resetForm();
}

function deleteActivity(id) {
  if (confirm("Are you sure you want to delete this activity?")) {
    activitiesStore.deleteActivity(id);
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

    <!-- Activities List -->
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
          <tr v-for="act in activities" :key="act.id">
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
              <button @click="deleteActivity(act.id)" class="btn-icon text-danger" title="Delete">
                <Trash2 style="width: 16px; height: 16px" />
              </button>
            </td>
          </tr>
          <tr v-if="activities.length === 0">
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
