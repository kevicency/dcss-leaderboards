import { Omit } from 'lodash'
import createRouter5, { Route as Router5Route, Router } from 'router5'
import { Options } from 'router5/create-router'
import browserPlugin from 'router5/plugins/browser'
import loggerPlugin from 'router5/plugins/logger'
export { Params, Router, State } from 'router5'

export type RouteDefinition = Omit<Router5Route, 'children'> & {
  component?: any
  children?: RouteDefinition[]
}

const defaultRouterOptions: Partial<Options> = {
  strictTrailingSlash: false,
  trailingSlashMode: 'never',
}

export function startRouter(router: Router) {
  return new Promise((resolve, reject) => {
    router.start((err, state) => {
      if (err) {
        reject(err)
      } else {
        resolve(state)
      }
    })
  })
}

export function createRouter(
  routes: RouteDefinition[],
  options: Partial<Options> & { useLogger?: boolean }
) {
  const { useLogger, ...routerOptions } = options
  const router = createRouter5(routes, {
    ...defaultRouterOptions,
    ...routerOptions,
  })
    // Plugins
    .usePlugin(browserPlugin({ useHash: false }))

  if (useLogger) {
    router.usePlugin(loggerPlugin)
  }

  return router
}
