<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '../store/auth';
import { useUsersStore } from '../store/users';
import { useActivitiesStore } from '../store/activities';

const authStore = useAuthStore();
const usersStore = useUsersStore();
const activitiesStore = useActivitiesStore();

const friends = computed(() => usersStore.getFriends(authStore.currentUser.id));
const friendIds = computed(() => friends.value.map(f => f.id));
const friendsActivities = computed(() => activitiesStore.getFriendsActivities(friendIds.value));

const allUsers = computed(() => usersStore.users.filter(u => u.id !== authStore.currentUser.id));

function isFriend(userId) {
  return friendIds.value.includes(userId);
}

function toggleFriend(userId) {
  usersStore.toggleFriend(authStore.currentUser.id, userId);
}
</script>

<template>
  <div class="container py-12">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Friends Activity</h1>
      <p class="text-secondary">Keep up with your buddies and stay motivated</p>
    </div>

    <div class="grid grid-cols-1" style="grid-template-columns: 1fr 3fr;">
      
      <!-- Users Directory Sidebar -->
      <div class="card p-4">
        <h2 class="text-xl font-semibold mb-4">Community</h2>
        <div class="users-list flex flex-col gap-2">
          <div v-for="user in allUsers" :key="user.id" class="flex items-center justify-between p-2 rounded-md hover:bg-surface-hover transition-colors" style="border: 1px solid var(--border)">
            <div>
              <p class="font-medium text-sm">{{ user.name }}</p>
              <p class="text-xs text-secondary">{{ user.email }}</p>
            </div>
            <button 
              @click="toggleFriend(user.id)" 
              class="btn text-xs" 
              :class="isFriend(user.id) ? 'btn-secondary' : 'btn-primary'"
            >
              {{ isFriend(user.id) ? 'Remove' : 'Add' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Feed Main Content -->
      <div>
        <h2 class="text-2xl font-bold mb-4">Feed</h2>
        
        <div class="feed-list grid grid-cols-1 gap-4">
          <div v-for="act in friendsActivities" :key="act.id" class="card p-4">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-bold text-lg text-primary mb-1">
                  {{ usersStore.getUserById(act.userId)?.name }}
                </p>
                <div class="badge badge-secondary mb-2">{{ act.type }}</div>
                <p class="text-sm text-secondary">{{ act.date }}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-xl">{{ act.duration }} <span class="text-sm font-normal text-secondary">min</span></p>
                <p v-if="act.distance" class="font-bold text-lg">{{ act.distance }} <span class="text-sm font-normal text-secondary">km</span></p>
              </div>
            </div>
            <div v-if="act.note" class="mt-4 p-3 bg-surface-hover rounded-md border border-border">
              <p class="text-sm italic mb-0">"{{ act.note }}"</p>
            </div>
          </div>
          
          <div v-if="friendsActivities.length === 0" class="card p-8 text-center bg-surface text-secondary">
            <p>Your friends haven't logged any activities yet, or you haven't added any active friends.</p>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>
