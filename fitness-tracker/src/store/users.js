import { defineStore } from 'pinia';

export const useUsersStore = defineStore('users', {
    state: () => ({
        users: [
            { id: 1, name: "Alice Admin", email: "alice@example.com", password: "pass", role: "admin", friends: [] },
            { id: 2, name: "Bob User", email: "bob@example.com", password: "pass", role: "user", friends: [3] },
            { id: 3, name: "Charlie User", email: "charlie@example.com", password: "pass", role: "user", friends: [2] },
            { id: 4, name: "Dave Friend", email: "dave@example.com", password: "pass", role: "user", friends: [2, 3] },
        ],
        nextId: 5
    }),
    actions: {
        addUser(user) {
            this.users.push({
                ...user,
                id: this.nextId++,
                friends: user.friends || []
            });
        },
        updateUser(id, data) {
            const index = this.users.findIndex(u => u.id === id);
            if (index !== -1) {
                this.users[index] = { ...this.users[index], ...data };
            }
        },
        deleteUser(id) {
            this.users = this.users.filter(u => u.id !== id);
        },
        toggleFriend(userId, friendId) {
            const user = this.users.find(u => u.id === userId);
            if (!user) return;
            const index = user.friends.indexOf(friendId);
            if (index === -1) {
                user.friends.push(friendId);
            } else {
                user.friends.splice(index, 1);
            }
        }
    },
    getters: {
        getUserById: (state) => (id) => {
            return state.users.find(u => u.id === id);
        },
        getFriends: (state) => (userId) => {
            const user = state.users.find(u => u.id === userId);
            if (!user) return [];
            return state.users.filter(u => user.friends.includes(u.id));
        }
    }
});
