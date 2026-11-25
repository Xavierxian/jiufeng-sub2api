import type { RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'

type NavigationAuth = { isAdmin: boolean; isSimpleMode: boolean }
type NavigationRoute = Pick<RouteLocationNormalizedLoaded, 'path' | 'query'> & {
  redirectedFrom?: { path: string }
}

// The shared router blocks /admin/groups in simple mode. Keep this adapter in
// Jiufeng and use the existing admin-only dashboard route for the same page.
export function jiufengNavigationTarget(path: string, auth: NavigationAuth): RouteLocationRaw {
  if (path === '/admin/groups' && auth.isAdmin && auth.isSimpleMode) {
    return { path: '/admin/dashboard', query: { view: 'groups' } }
  }
  return path
}

export function isJiufengSimpleGroupsRoute(route: NavigationRoute, auth: NavigationAuth): boolean {
  return auth.isAdmin && auth.isSimpleMode &&
    route.path === '/admin/dashboard' && (
      route.query.view === 'groups' ||
      route.redirectedFrom?.path.replace(/\/$/, '') === '/admin/groups'
    )
}

export function jiufengNavigationPath(route: NavigationRoute, auth: NavigationAuth): string {
  return isJiufengSimpleGroupsRoute(route, auth) ? '/admin/groups' : route.path
}
