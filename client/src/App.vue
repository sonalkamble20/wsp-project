<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="app-layout">
    <NavBar />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>
