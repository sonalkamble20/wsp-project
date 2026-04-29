<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { useActivitiesStore } from '../store/activities';
import { Activity, Flame, Navigation, Timer } from 'lucide-vue-next';

const authStore = useAuthStore();
const activitiesStore = useActivitiesStore();

onMounted(async () => {
  await Promise.all([
    activitiesStore.fetchActivities(),
    activitiesStore.fetchStats(),
  ]);
});
</script>

<template>
  <div class="container py-12">
    <div class="header mb-8">
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <p class="text-secondary">Welcome back, {{ authStore.currentUser?.name }}. Here is your progress.</p>
    </div>

    <!-- Error banner -->
    <div v-if="activitiesStore.error" class="error-banner mb-6">
      {{ activitiesStore.error }}
    </div>

    <!-- Stats Grid -->
    <div v-if="activitiesStore.stats" class="stats-grid mb-12">
      <div class="stat-card">
        <div class="stat-icon-wrapper bg-primary-soft">
          <Activity class="stat-icon text-primary" />
        </div>
        <div class="stat-info">
          <p class="stat-label">Total Workouts</p>
          <p class="stat-value">{{ activitiesStore.stats.totalWorkouts }}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper bg-success-soft">
          <Timer class="stat-icon text-success" />
        </div>
        <div class="stat-info">
          <p class="stat-label">Total Duration</p>
          <p class="stat-value">{{ activitiesStore.stats.totalDuration }} <span class="text-sm text-secondary">min</span></p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper bg-warning-soft">
          <Navigation class="stat-icon text-warning" />
        </div>
        <div class="stat-info">
          <p class="stat-label">Total Distance</p>
          <p class="stat-value">{{ activitiesStore.stats.totalDistance }} <span class="text-sm text-secondary">km</span></p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper bg-danger-soft">
          <Flame class="stat-icon text-danger" />
        </div>
        <div class="stat-info">
          <p class="stat-label">Favorite Type</p>
          <p class="stat-value text-lg">{{ activitiesStore.stats.favoriteType }}</p>
        </div>
      </div>
    </div>

    <!-- Skeleton while loading -->
    <div v-else-if="activitiesStore.loading" class="stats-grid mb-12">
      <div v-for="n in 4" :key="n" class="stat-card skeleton-card">
        <div class="skeleton-block" style="width:48px;height:48px;border-radius:50%"></div>
        <div style="flex:1">
          <div class="skeleton-block mb-2" style="width:60%;height:12px"></div>
          <div class="skeleton-block" style="width:40%;height:24px"></div>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="recent-section">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold">Recent Activities</h2>
        <router-link to="/activities" class="btn btn-secondary">View All</router-link>
      </div>

      <div class="activity-list grid grid-cols-1">
        <div
          v-for="act in activitiesStore.activities.slice(0, 3)"
          :key="act._id"
          class="card rounded-lg flex items-center p-4"
        >
          <div class="app-icon-lg mr-4 bg-surface-hover rounded-full">
            <span class="text-2xl p-3 inline-block">🏃‍♂️</span>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-bold mb-1">{{ act.type }}</h3>
            <p class="text-sm text-secondary mb-0">
              {{ act.date }} &bull; {{ act.duration }} min
              <span v-if="act.distance"> &bull; {{ act.distance }} km</span>
            </p>
          </div>
          <div v-if="act.note" class="text-right">
            <div class="badge badge-primary">{{ act.note }}</div>
          </div>
        </div>

        <div v-if="!activitiesStore.loading && activitiesStore.activities.length === 0" class="card p-8 text-center text-secondary">
          <p>No activities yet. Let's get moving!</p>
          <router-link to="/activities" class="btn btn-primary mt-4">Add your first workout</router-link>
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

.skeleton-card {
  pointer-events: none;
}

.skeleton-block {
  background: linear-gradient(90deg, var(--border) 25%, var(--surface-hover) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
  display: block;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
