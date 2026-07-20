import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'today',
      component: () => import('../pages/Today.vue'),
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../pages/History.vue'),
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('../pages/Stats.vue'),
    },
  ],
});

export default router;
