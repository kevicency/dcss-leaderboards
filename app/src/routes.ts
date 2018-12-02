import { constants } from 'router5'
import { RouteDefinition } from './router'

const routes: RouteDefinition[] = [
  {
    name: 'home',
    path: '/',
    forwardTo: 'rankings.player',
  },
  {
    name: 'rankings',
    path: '/rankings',
    forwardTo: 'rankings.player',
    component: null,
    children: [
      {
        name: 'player',
        path: '/',
        component: null,
      },
      {
        name: 'race',
        path: '/race',
      },
      {
        name: 'background',
        path: '/background',
      },
      {
        name: 'god',
        path: '/god',
      },
    ],
  },
  {
    name: 'highscore',
    path: '/highscore',
    forwardTo: 'highscore.combo',
    children: [
      {
        name: 'combo',
        path: '/combo',
      },
    ],
  },
  {
    name: 'index-html',
    path: '/index.html',
    forwardTo: 'rankings.player',
  },
  {
    name: constants.UNKNOWN_ROUTE,
    path: '/404',
    component: 'Error 404',
  },
]

export default routes
