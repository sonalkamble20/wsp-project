<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { useUsersStore } from '../store/users';
import { useActivitiesStore } from '../store/activities';

const authStore = useAuthStore();
const usersStore = useUsersStore();
const activitiesStore = useActivitiesStore();

onMounted(async () => {
  await Promise.all([
    usersStore.fetchAllUsers(),
    usersStore.fetchFriends(),
    activitiesStore.fetchFriendsFeed(),
  ]);
});

// Other users to display in the community sidebar (exclude self)
function otherUsers() {
  return usersStore.allUsers.filter((u) => u._id !== authStore.currentUser.id);
}

async function toggleFriend(userId) {
  await usersStore.toggleFriend(userId);
  // Refresh feed after friend change
  await activitiesStore.fetchFriendsFeed();
}
</script>

<template>
  <div class="container py-12">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Friends Activity</h1>
      <p class="text-secondary">Keep up with your buddies and stay motivated</p>
    </div>

    <!-- Error banners -->
    <div v-if="usersStore.error" class="error-banner mb-4">{{ usersStore.error }}</div>
    <div v-if="activitiesStore.error" class="error-banner mb-4">{{ activitiesStore.error }}</div>

    <div class="grid grid-cols-1" style="grid-template-columns: 1fr 3fr;">

      <!-- Community Sidebar -->
      <div class="card p-4">
        <h2 class="text-xl font-semibold mb-4">Community</h2>
        <div v-if="usersStore.loading" class="text-secondary text-sm">Loading…</div>
        <div class="users-list flex flex-col gap-2">
          <div
            v-for="user in otherUsers()"
            :key="user._id"
            class="flex items-center justify-between p-2 rounded-md hover:bg-surface-hover transition-colors"
            style="border: 1px solid var(--border)"
          >
            <div>
              <p class="font-medium text-sm">{{ user.name }}</p>
              <p class="text-xs text-secondary">{{ user.email }}</p>
            </div>
            <button
              @click="toggleFriend(user._id)"
              class="btn text-xs"
              :class="usersStore.isFriend(user._id) ? 'btn-secondary' : 'btn-primary'"
            >
              {{ usersStore.isFriend(user._id) ? 'Remove' : 'Add' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Friends Feed -->
      <div>
        <h2 class="text-2xl font-bold mb-4">Feed</h2>

        <div v-if="activitiesStore.loading" class="text-secondary text-sm">Loading feed…</div>

        <div class="feed-list grid grid-cols-1 gap-4">
          <div v-for="act in activitiesStore.friendsFeed" :key="act._id" class="card p-4">
            <div class="flex items-start justify-between">
              <div>
                <p class="font-bold text-lg text-primary mb-1">
                  {{ act.owner?.name ?? 'Unknown' }}
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

          <div
            v-if="!activitiesStore.loading && activitiesStore.friendsFeed.length === 0"
            class="card p-8 text-center bg-surface text-secondary"
          >
            <p>Your friends haven't logged any activities yet, or you haven't added any friends.</p>
          </div>
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
