<script setup>
import { ref, onMounted } from 'vue';
import { useUsersStore } from '../store/users';
import { Edit2, Trash2, X, UserPlus } from 'lucide-vue-next';

const usersStore = useUsersStore();

onMounted(() => {
  usersStore.fetchAllUsers();
});

const showModal = ref(false);
const editingId = ref(null);

const form = ref({
  name: '',
  role: 'user'
});

function resetForm() {
  form.value = { name: '', role: 'user' };
  editingId.value = null;
  showModal.value = false;
}

function openEdit(user) {
  form.value = { name: user.name, role: user.role };
  editingId.value = user._id;
  showModal.value = true;
}

async function saveUser() {
  if (editingId.value) {
    await usersStore.updateUser(editingId.value, { ...form.value });
  }
  if (!usersStore.error) resetForm();
}

async function deleteUser(id) {
  if (confirm('Are you sure you want to delete this user?')) {
    await usersStore.deleteUser(id);
  }
}
</script>

<template>
  <div class="container py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">User Management</h1>
        <p class="text-secondary">Admin area to edit or remove users</p>
      </div>
    </div>

    <!-- Error banner -->
    <div v-if="usersStore.error" class="error-banner mb-4">{{ usersStore.error }}</div>

    <!-- Users Table -->
    <div class="card table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="usersStore.loading">
            <td colspan="5" class="p-8 text-center text-secondary">Loading…</td>
          </tr>
          <tr v-for="user in usersStore.allUsers" :key="user._id">
            <td class="font-bold">{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge" :class="user.role === 'admin' ? 'badge-primary' : 'badge-secondary'">
                {{ user.role.toUpperCase() }}
              </span>
            </td>
            <td class="text-sm text-secondary">{{ new Date(user.createdAt).toLocaleDateString() }}</td>
            <td class="text-right">
              <button @click="openEdit(user)" class="btn-icon mr-2" title="Edit">
                <Edit2 style="width: 16px; height: 16px" />
              </button>
              <button @click="deleteUser(user._id)" class="btn-icon text-danger" title="Delete">
                <Trash2 style="width: 16px; height: 16px" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Edit user -->
    <div v-if="showModal" class="modal-overlay" @click.self="resetForm">
      <div class="modal slide-up-enter-active">
        <div class="card-header">
          <h2 class="card-title">Edit User</h2>
          <button @click="resetForm" class="btn-icon">
            <X style="width: 20px; height: 20px" />
          </button>
        </div>

        <div class="card-body">
          <form @submit.prevent="saveUser">
            <div class="grid grid-cols-1 gap-4">
              <div class="form-group">
                <label class="form-label" for="name">Full Name</label>
                <input v-model="form.name" type="text" id="name" class="form-control" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="role">Role</label>
                <select v-model="form.role" id="role" class="form-control" required>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div v-if="usersStore.error" class="error-banner mt-2">{{ usersStore.error }}</div>

            <div class="mt-6 flex justify-end gap-2">
              <button type="button" @click="resetForm" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
          </form>
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
