// tslint:disable:jsx-no-lambda

import { Pivot, PivotItem } from 'office-ui-fabric-react'
import * as React from 'react'
import { InjectedRouterNode, withRoute } from 'react-router5'
import logo from '../assets/logo.png'
import { ContentContainer } from '../components'
import styled, { cssify, Flex } from '../styled'

const Container = styled.div`
  background: ${({ theme }) => theme.palette.neutralLight};
  > * { overflow: hidden; }
  /* color: ${({ theme }) => theme.palette.white}; */
`
const TitleContainer = styled(Flex)`
  white-space: pre;
  overflow: hidden;
`

const Title = styled.h1`
  ${({ theme }) => cssify(theme.fonts.xLarge)}
  overflow: hidden;

  span {
    display: none;
  }

  img {
    vertical-align: text-bottom;
    margin-right: 5px;
  }

  @media screen and (min-width: 480px) {
    span {
      display: inline;
    }
  }
`

export type HeaderProps = Partial<InjectedRouterNode> & {}
export const Header = withRoute(({ router, route }: HeaderProps) => (
  <Container>
    <ContentContainer px={2} justifyContent="space-between" flexWrap="wrap">
      <TitleContainer pt={2} mr={2}>
        <Title>
          <img src={logo} alt="DCSS Leaderboards Logo" height="24" />
          <span>DCSS Leaderboards</span>
        </Title>
      </TitleContainer>

      <Flex alignItems="center" pt={1} flex="4" justifyContent="flex-end">
        <Pivot
          headersOnly={true}
          selectedKey={route ? route.name.replace(/\..*/, '') : null}
          onLinkClick={item => {
            router.navigate(item.props.itemKey)
          }}>
          <PivotItem itemKey="speedruns" headerText="Speedruns" />
          <PivotItem itemKey="turncountruns" headerText="Turncountruns" />
          <PivotItem itemKey="highscores" headerText="Highscores" />
        </Pivot>
      </Flex>
    </ContentContainer>
  </Container>
))
