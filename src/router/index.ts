import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: () => import('../layouts/PublicLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: 'buscar',
          name: 'search',
          component: () => import('../views/SearchView.vue'),
        },
        {
          path: 'debates',
          name: 'debates',
          component: () => import('../views/DebatesView.vue'),
        },
        {
          path: 'debates/:id',
          name: 'debate',
          component: () => import('../views/DebateDetailView.vue'),
        },
        {
          path: 'noticias/:id',
          name: 'news-item',
          component: () => import('../views/NewsDetailView.vue'),
        },
        {
          path: 'noticias',
          name: 'news',
          component: () => import('../views/NewsView.vue'),
        },
        {
          path: 'votaciones',
          name: 'polls',
          component: () => import('../views/PollsView.vue'),
        },
        {
          path: 'cuenta',
          name: 'account',
          component: () => import('../views/AccountView.vue'),
        },
        {
          path: 'ingresar',
          name: 'login',
          component: () => import('../views/LoginView.vue'),
        },
        {
          path: 'terminos',
          name: 'terms',
          component: () => import('../views/TermsView.vue'),
        },
        {
          path: 'privacidad',
          name: 'privacy',
          component: () => import('../views/PrivacyView.vue'),
        },
      ],
    },
  ],
})

export default router
