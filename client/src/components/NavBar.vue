<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.isAdmin);

function logout() {
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <nav v-if="isAuthenticated" class="navbar">
    <div class="container navbar-container">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-item brand-text">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="navbar-icon"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m8 17 4 4 4-4"></path></svg>
          FitTrak
        </router-link>
      </div>

      <div class="navbar-menu">
        <router-link to="/" class="navbar-item">Dashboard</router-link>
        <router-link to="/activities" class="navbar-item">Activities</router-link>
        <router-link to="/friends" class="navbar-item">Friends</router-link>
        <router-link v-if="isAdmin" to="/admin" class="navbar-item badge-primary" style="margin-right: 1rem; border-radius: var(--radius-sm)">Admin</router-link>

        <div class="navbar-end">
          <span class="navbar-item text-secondary">Hello, {{ authStore.currentUser.name }}</span>
          <button @click="logout" class="btn btn-secondary text-sm">Logout</button>
        </div>
      </div>
    </div>
  </nav>
</template>
