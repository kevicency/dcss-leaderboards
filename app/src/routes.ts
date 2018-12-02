import { constants } from 'router5'
import { RouteDefinition } from './router'

const routes: RouteDefinition[] = [
  {
    name: 'home',
    path: '/',
    forwardTo: 'speedruns.player',
  },
  {
    name: 'speedruns',
    path: '/speedruns',
    forwardTo: 'speedruns.player',
    children: [
      {
        name: 'player',
        path: '/player',
      },
      {
        name: 'player15Runes',
        path: '/player15r',
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
    name: 'highscores',
    path: '/highscores',
    forwardTo: 'highscores.combo',
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
    forwardTo: 'speedruns.player',
  },
  {
    name: constants.UNKNOWN_ROUTE,
    path: '/404',
  },
]

export default routes
