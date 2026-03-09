<script setup>
import { ref } from 'vue';
import { useUsersStore } from '../store/users';
import { Edit2, Trash2, X, UserPlus } from 'lucide-vue-next';

const usersStore = useUsersStore();

const showModal = ref(false);
const editingId = ref(null);

const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'user'
});

function resetForm() {
  form.value = {
    name: '',
    email: '',
    password: '',
    role: 'user'
  };
  editingId.value = null;
  showModal.value = false;
}

function openAdd() {
  resetForm();
  showModal.value = true;
}

function openEdit(user) {
  form.value = { ...user };
  editingId.value = user.id;
  showModal.value = true;
}

function saveUser() {
  if (editingId.value) {
    usersStore.updateUser(editingId.value, { ...form.value });
  } else {
    usersStore.addUser({ ...form.value });
  }
  resetForm();
}

function deleteUser(id) {
  if (confirm("Are you sure you want to delete this user?")) {
    usersStore.deleteUser(id);
  }
}
</script>

<template>
  <div class="container py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">User Management</h1>
        <p class="text-secondary">Admin area to add, edit, or remove users</p>
      </div>
      <button @click="openAdd" class="btn btn-primary">
        <UserPlus style="width: 16px; margin-right:8px" />
        Add User
      </button>
    </div>

    <!-- Users Table -->
    <div class="card table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usersStore.users" :key="user.id">
            <td class="font-medium">#{{ user.id }}</td>
            <td class="font-bold">{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge" :class="user.role === 'admin' ? 'badge-primary' : 'badge-secondary'">
                {{ user.role.toUpperCase() }}
              </span>
            </td>
            <td class="text-right">
              <button @click="openEdit(user)" class="btn-icon mr-2" title="Edit">
                <Edit2 style="width: 16px; height: 16px" />
              </button>
              <button @click="deleteUser(user.id)" class="btn-icon text-danger" title="Delete">
                <Trash2 style="width: 16px; height: 16px" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-overlay" @click.self="resetForm">
      <div class="modal slide-up-enter-active">
        <div class="card-header">
          <h2 class="card-title">{{ editingId ? 'Edit User' : 'Add New User' }}</h2>
          <button @click="resetForm" class="btn-icon">
            <X style="width: 20px; height: 20px" />
          </button>
        </div>
        
        <div class="card-body">
          <form @submit.prevent="saveUser">
            <div class="grid grid-cols-1 gap-4">
              <div class="form-group">
                <label class="form-label" for="name">Full Name</label>
                <input v-model="form.name" type="text" id="name" class="form-control" required placeholder="John Doe">
              </div>

              <div class="form-group">
                <label class="form-label" for="email">Email Address</label>
                <input v-model="form.email" type="email" id="email" class="form-control" required placeholder="john@example.com">
              </div>

              <div class="form-group">
                <label class="form-label" for="password">Password</label>
                <input v-model="form.password" type="password" id="password" class="form-control" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="role">Role</label>
                <select v-model="form.role" id="role" class="form-control" required>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div class="mt-6 flex justify-end gap-2">
              <button type="button" @click="resetForm" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary">Save User</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
