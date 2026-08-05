import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'weather-home',
    component: () => import('@/views/WeatherHomeView.vue'),
  },

  {
    path: '/saved',
    name: 'weather-saved',
    component: () => import('@/views/WeatherFavoritesView.vue'),
  },

  {
    path: '/favorites',
    redirect: '/saved',
  },

  {
    path: '/about',
    name: 'weather-about',
    component: () => import('@/views/WeatherAboutView.vue'),
  },

  {
    path: '/project',
    name: 'weather-project',
    component: () => import('@/views/WeatherProjectView.vue'),
  },

  {
    path: '/weather/:cityId',
    name: 'weather-detail',
    component: () => import('@/views/WeatherDetailView.vue'),
  },

  /**
   * 등록되지 않은 모든 주소를 처리합니다.
   * 반드시 마지막에 작성합니다.
   */
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,

  scrollBehavior() {
    return {
      top: 0,
    }
  },
})

export default router
