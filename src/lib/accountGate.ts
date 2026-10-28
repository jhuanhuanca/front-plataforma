import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'

export function sendToRegister(router: Router, route: RouteLocationNormalizedLoaded): void {
  void router.push({
    name: 'login',
    query: {
      modo: 'registro',
      siguiente: route.fullPath,
    },
  })
}
