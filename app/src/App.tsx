import { Fabric } from 'office-ui-fabric-react'
import * as React from 'react'
import { InjectedRouterNode, RouteNode } from 'react-router5'
import { ContentContainer, Footer, Header } from './components'
import styled, { Flex } from './styled'
import { Error404View, RankingsView } from './views'

const Body = styled(Flex)`
  min-height: 100vh;
  width: 100vw;

  overflow-x: auto;
`

class App extends React.Component {
  public render() {
    return (
      <Fabric>
        <Body flexDirection="column">
          <Header />
          <ContentContainer flex="1">
            <RouteNode nodeName="">
              {({ route }: InjectedRouterNode) => (
                <React.Fragment>
                  {/rankings\/?.*/.test(route.name) && <RankingsView />}
                  {/UNKNOWN_ROUTE\/?.*/.test(route.name) && <Error404View />}
                </React.Fragment>
              )}
            </RouteNode>
          </ContentContainer>
          <Footer />
        </Body>
      </Fabric>
    )
  }
}

export default App
