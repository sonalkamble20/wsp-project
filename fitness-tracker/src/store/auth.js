import { defineStore } from 'pinia';
import { useUsersStore } from './users';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        currentUser: null
    }),
    actions: {
        login(email, password) {
            const usersStore = useUsersStore();
            const user = usersStore.users.find(
                (u) => u.email === email && u.password === password
            );
            if (user) {
                this.currentUser = user;
                return true;
            }
            return false;
        },
        logout() {
            this.currentUser = null;
        }
    },
    getters: {
        isAuthenticated: (state) => !!state.currentUser,
        isAdmin: (state) => state.currentUser?.role === 'admin'
    }
});
