import { Fabric } from 'office-ui-fabric-react'
import * as React from 'react'
import { InjectedRouterNode, RouteNode } from 'react-router5'
import { Footer, Header } from './components'
import styled, { Flex } from './styled'
import { ComboHighscoresView, Error404View, SpeedrunsView } from './views'

const Body = styled(Flex)`
  min-height: 100vh;
  width: 100vw;

  overflow-x: hidden;
`

class App extends React.Component {
  public render() {
    return (
      <Fabric>
        <Body flexDirection="column">
          <Header />
          <RouteNode nodeName="">
            {({ route }: InjectedRouterNode) => (
              <React.Fragment>
                {/speedruns\/?.*/.test(route.name) && <SpeedrunsView />}
                {/highscore\/?.*/.test(route.name) && <ComboHighscoresView />}
                {/UNKNOWN_ROUTE\/?.*/.test(route.name) && <Error404View />}
              </React.Fragment>
            )}
          </RouteNode>
          <Footer />
        </Body>
      </Fabric>
    )
  }
}

export default App
