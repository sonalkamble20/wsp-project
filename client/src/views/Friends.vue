import { ref, onMounted } from 'vue';
import { useInfiniteScroll } from '@vueuse/core';
import { useAuthStore } from '../store/auth';
import { useUsersStore } from '../store/users';
import { useActivitiesStore } from '../store/activities';

const authStore = useAuthStore();
const usersStore = useUsersStore();
const activitiesStore = useActivitiesStore();

const el = ref(null);

// Triggered when user scrolls near bottom
useInfiniteScroll(
  el,
  async () => {
    if (activitiesStore.feedHasMore && !activitiesStore.loading) {
      await activitiesStore.fetchFriendsFeedPaginated();
    }
  },
  { distance: 50 }
);

onMounted(async () => {
  activitiesStore.resetFeed();
  await Promise.all([
    usersStore.fetchAllUsers(),
    usersStore.fetchFriends(),
    activitiesStore.fetchFriendsFeedPaginated(),
  ]);
});

// Other users to display in the community sidebar (exclude self)
function otherUsers() {
  return usersStore.allUsers.filter((u) => u._id !== authStore.currentUser.id);
}

async function toggleFriend(userId) {
  await usersStore.toggleFriend(userId);
  // Refresh feed after friend change
  activitiesStore.resetFeed();
  await activitiesStore.fetchFriendsFeedPaginated();
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
      <div ref="el" class="feed-container">
        <div class="flex justify-between items-end mb-4">
          <h2 class="text-2xl font-bold">Feed</h2>
          <p v-if="activitiesStore.feedTotal > 0" class="text-sm text-secondary mb-1">
            Showing {{ activitiesStore.feedItems.length }} of {{ activitiesStore.feedTotal }} activities
          </p>
        </div>

        <div class="feed-list grid grid-cols-1 gap-4">
          <!-- Feed Items -->
          <div v-for="act in activitiesStore.feedItems" :key="act._id" class="card p-4">
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

          <!-- Loading Skeletons -->
          <div v-if="activitiesStore.loading" class="skeleton-container grid grid-cols-1 gap-4">
            <div v-for="n in 2" :key="n" class="card p-4 skeleton-card">
              <div class="skeleton-line w-1/3 h-6 mb-2"></div>
              <div class="skeleton-line w-1/4 h-4 mb-4"></div>
              <div class="skeleton-line w-full h-12"></div>
            </div>
          </div>

          <div
            v-if="!activitiesStore.loading && activitiesStore.feedItems.length === 0"
            class="card p-8 text-center bg-surface text-secondary"
          >
            <p>Your friends haven't logged any activities yet, or you haven't added any friends.</p>
          </div>

          <div v-if="!activitiesStore.feedHasMore && activitiesStore.feedItems.length > 0" class="text-center py-4 text-secondary text-sm">
            You've reached the end of the feed!
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

.feed-container {
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 1rem;
}

/* Skeleton Styles */
.skeleton-card {
  pointer-events: none;
}

.skeleton-line {
  background: linear-gradient(90deg, var(--border) 25%, var(--surface-hover) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
