import { initializeIcons } from 'office-ui-fabric-react/lib/Icons'
import * as React from 'react'
import { ApolloProvider } from 'react-apollo'
import * as ReactDOM from 'react-dom'
import { RouteProvider, RouterProvider } from 'react-router5'
import { ThemeProvider } from 'styled-components'
import { createApolloClient } from './apollo'
import * as AppModule from './App'
import registerServiceWorker from './registerServiceWorker'
import { createRouter, startRouter } from './router'
import routes from './routes'
import { loadTheme } from './theme'

initializeIcons()

const apolloClient = createApolloClient()
const theme = loadTheme()
const router = createRouter(routes, {
  useLogger: process.env.NODE_ENV !== 'production',
  allowNotFound: true,
  caseSensitive: false,
})

let App = AppModule.default

function render() {
  ReactDOM.render(
    <RouterProvider router={router}>
      <RouteProvider router={router}>
        <ApolloProvider client={apolloClient}>
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </ApolloProvider>
      </RouteProvider>
    </RouterProvider>,
    document.getElementById('root') as HTMLElement
  )
}

function startup() {
  Promise.all([startRouter(router)])
    .then(() => {
      render()
    })
    .catch(err => {
      // tslint:disable-next-line:no-console
      console.error('startup error', err)
    })
}

startup()
registerServiceWorker()

if (module.hot) {
  module.hot.accept(['./App.tsx'], () => {
    App = require<typeof AppModule>('./App').default

    render()
  })
}
