<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('alice@example.com');
const password = ref('pass');
const error = ref('');

function submitLogin() {
  if (authStore.login(email.value, password.value)) {
    router.push('/');
  } else {
    error.value = 'Invalid email or password';
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header text-center mb-6">
        <h1 class="text-3xl text-primary font-bold mb-2">FitTrak</h1>
        <p class="text-secondary">Sign in to your account</p>
      </div>

      <form @submit.prevent="submitLogin" class="login-form">
        <div class="form-group">
          <label class="form-label" for="email">Email Address</label>
          <input 
            v-model="email" 
            id="email" 
            type="email" 
            class="form-control" 
            required 
            placeholder="alice@example.com"
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
            placeholder="pass"
          />
        </div>

        <div v-if="error" class="error-msg mb-4 text-danger text-sm text-center">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary login-btn w-full mt-4">
          Sign In
        </button>
      </form>
      
      <div class="login-footer mt-8 text-center text-sm text-secondary">
        <p>Demo Admin: alice@example.com / pass</p>
        <p>Demo User: bob@example.com / pass</p>
      </div>
    </div>
  </div>
</template>
