import type { NavigationGuard, RouteRecordRaw, Router } from 'vue-router'

const mcpRoutes: RouteRecordRaw[] = [
  {
    path: '/settings/mcp',
    name: 'MCP',
    component: () => import('./user/MCPView.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: false,
      title: 'MCP Connection',
      titleKey: 'mcp.title',
      descriptionKey: 'mcp.description',
    },
  },
  {
    path: '/oauth/mcp/authorize',
    name: 'MCPOAuthAuthorize',
    component: () => import('./auth/MCPOAuthAuthorizeView.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: false,
      title: 'Authorize MCP Application',
      titleKey: 'mcp.consentTitle',
    },
  },
]

export function installJiufengMcpRoutes(router: Router): void {
  for (const route of mcpRoutes) {
    if (!router.hasRoute(route.name!)) router.addRoute(route)
  }
}

// The shared router intentionally stays untouched. Its authenticated catch-all
// loads JFNotFoundView on a first visit to either MCP URL. Rematch before that
// view renders, preserving every OAuth query value and running the shared
// authentication/backend-mode guards again. beforeRouteUpdate also covers a
// navigation from an already-mounted 404 page.
export const resolveJiufengMcpRoute: NavigationGuard = async (to) => {
  const path = to.path.replace(/\/$/, '')
  if (!mcpRoutes.some(route => route.path === path)) return

  const { default: router } = await import('@/router')
  installJiufengMcpRoutes(router)
  return to.fullPath
}
