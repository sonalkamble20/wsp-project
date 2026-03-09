import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';

import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Activities from '../views/Activities.vue';
import Friends from '../views/Friends.vue';
import Admin from '../views/Admin.vue';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: Login,
        },
        {
            path: '/',
            name: 'dashboard',
            component: Dashboard,
            meta: { requiresAuth: true }
        },
        {
            path: '/activities',
            name: 'activities',
            component: Activities,
            meta: { requiresAuth: true }
        },
        {
            path: '/friends',
            name: 'friends',
            component: Friends,
            meta: { requiresAuth: true }
        },
        {
            path: '/admin',
            name: 'admin',
            component: Admin,
            meta: { requiresAuth: true, requiresAdmin: true }
        }
    ]
});

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;
    const isAdmin = authStore.isAdmin;

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login');
    } else if (to.meta.requiresAdmin && !isAdmin) {
        next('/');
    } else if (to.path === '/login' && isAuthenticated) {
        next('/');
    } else {
        next();
    }
});

export default router;
