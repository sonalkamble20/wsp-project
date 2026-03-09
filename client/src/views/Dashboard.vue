<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../store/auth';
import { useActivitiesStore } from '../store/activities';
import { Activity, Flame, Navigation, Timer } from 'lucide-vue-next';

const authStore = useAuthStore();
const activitiesStore = useActivitiesStore();

const userStats = computed(() => activitiesStore.getUserStats(authStore.currentUser.id));
const recentActivities = computed(() => {
  return activitiesStore.getUserActivities(authStore.currentUser.id).slice(0, 3);
});
</script>

<template>
  <div class="container py-12">
    <div class="header mb-8">
      <h1 class="text-3xl font-bold">Dashboard</h1>
      <p class="text-secondary">Welcome back, {{ authStore.currentUser.name }}. Here is your progress.</p>
    </div>

    <div class="stats-grid mb-12">
      <div class="stat-card">
        <div class="stat-icon-wrapper bg-primary-soft">
          <Activity class="stat-icon text-primary" />
        </div>
        <div class="stat-info">
          <p class="stat-label">Total Workouts</p>
          <p class="stat-value">{{ userStats.totalWorkouts }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon-wrapper bg-success-soft">
          <Timer class="stat-icon text-success" />
        </div>
        <div class="stat-info">
          <p class="stat-label">Total Duration</p>
          <p class="stat-value">{{ userStats.totalDuration }} <span class="text-sm text-secondary">min</span></p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper bg-warning-soft">
          <Navigation class="stat-icon text-warning" />
        </div>
        <div class="stat-info">
          <p class="stat-label">Total Distance</p>
          <p class="stat-value">{{ userStats.totalDistance }} <span class="text-sm text-secondary">km</span></p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrapper bg-danger-soft">
          <Flame class="stat-icon text-danger" />
        </div>
        <div class="stat-info">
          <p class="stat-label">Favorite Type</p>
          <p class="stat-value text-lg">{{ userStats.favoriteType }}</p>
        </div>
      </div>
    </div>

    <div class="recent-section">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold">Recent Activities</h2>
        <router-link to="/activities" class="btn btn-secondary">View All</router-link>
      </div>
      
      <div class="activity-list grid grid-cols-1">
        <div v-for="act in recentActivities" :key="act.id" class="card rounded-lg flex items-center p-4">
          <div class="app-icon-lg mr-4 bg-surface-hover rounded-full">
            <span class="text-2xl p-3 inline-block">🏃‍♂️</span>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-bold mb-1">{{ act.type }}</h3>
            <p class="text-sm text-secondary mb-0">{{ act.date }} &bull; {{ act.duration }} min <span v-if="act.distance">&bull; {{ act.distance }} km</span></p>
          </div>
          <div class="text-right">
            <div class="badge badge-primary">{{ act.note }}</div>
          </div>
        </div>
        
        <div v-if="recentActivities.length === 0" class="card p-8 text-center text-secondary">
          <p>No activities yet. Let's get moving!</p>
          <router-link to="/activities" class="btn btn-primary mt-4">Add your first workout</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
