<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();

const mode = ref('login'); // 'login' | 'register'
const name = ref('');
const email = ref('');
const password = ref('');

async function submit() {
  let success;
  if (mode.value === 'login') {
    success = await authStore.login(email.value, password.value);
  } else {
    if (!name.value.trim()) {
      authStore.error = 'Name is required.';
      return;
    }
    success = await authStore.register(name.value, email.value, password.value);
  }
  if (success) router.push('/');
}

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login';
  authStore.error = null;
  name.value = '';
  email.value = '';
  password.value = '';
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header text-center mb-6">
        <h1 class="text-3xl text-primary font-bold mb-2">FitTrak</h1>
        <p class="text-secondary">
          {{ mode === 'login' ? 'Sign in to your account' : 'Create a new account' }}
        </p>
      </div>

      <form @submit.prevent="submit" class="login-form">
        <!-- Name field — only visible in register mode -->
        <div v-if="mode === 'register'" class="form-group">
          <label class="form-label" for="name">Full Name</label>
          <input
            v-model="name"
            id="name"
            type="text"
            class="form-control"
            required
            placeholder="Jane Smith"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="email">Email Address</label>
          <input
            v-model="email"
            id="email"
            type="email"
            class="form-control"
            required
            placeholder="you@example.com"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input
            v-model="password"
            id="password"
            type="password"
            class="form-control"
            required
            :placeholder="mode === 'register' ? 'Min. 6 characters' : '••••••••'"
          />
        </div>

        <div v-if="authStore.error" class="error-msg mb-4 text-danger text-sm text-center">
          {{ authStore.error }}
        </div>

        <button type="submit" class="btn btn-primary login-btn w-full mt-4" :disabled="authStore.loading">
          {{ authStore.loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account' }}
        </button>
      </form>

      <div class="login-footer mt-6 text-center text-sm text-secondary">
        <span v-if="mode === 'login'">
          Don't have an account?
          <button @click="toggleMode" class="btn-link">Register</button>
        </span>
        <span v-else>
          Already have an account?
          <button @click="toggleMode" class="btn-link">Sign In</button>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-link {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: inherit;
  padding: 0;
  font-weight: 600;
  text-decoration: underline;
}
.btn-link:hover {
  color: var(--primary-hover);
}
</style>
