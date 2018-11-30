// tslint:disable:jsx-no-lambda

import { ContentContainer } from 'components'
import { Pivot, PivotItem } from 'office-ui-fabric-react'
import * as React from 'react'
import { withRoute } from 'react-router5'
import { RouteDefinition, Router } from 'router'
import styled, { cssify, Flex } from 'styled'
import logo from '../assets/speedcrawl.png'

const Container = styled.div`
  background: ${({ theme }) => theme.palette.neutralLight};
  /* color: ${({ theme }) => theme.palette.white}; */
`
const TitleContainer = styled(Flex)`
  white-space: pre;
  overflow: hidden;
`

const Title = styled.h1`
  ${({ theme }) => cssify(theme.fonts.xLarge)}
  overflow: hidden;

  img {
    vertical-align: text-bottom;
    margin-right: 6px;
  }
`

export interface HeaderProps {
  router?: Router
  route?: RouteDefinition
}
export const Header = withRoute(({ router, route }: HeaderProps) => (
  <Container>
    <ContentContainer px={2} justifyContent="space-between" flexWrap="wrap">
      <TitleContainer flex="1" pt={2} mr={4}>
        <Title>
          <img src={logo} alt="Speedcrawl" height="24" />
          Speedcrawl
        </Title>
      </TitleContainer>

      <Flex alignItems="center" pt={1} flex="3" justifyContent="flex-end">
        <Pivot
          headersOnly={true}
          selectedKey={route ? route.name.replace(/rankings\./, '') : null}
          onLinkClick={item => {
            router.navigate(`rankings.${item.props.itemKey}`)
          }}>
          <PivotItem itemKey="player" headerText="by Player" />
          <PivotItem itemKey="race" headerText="by Race" />
          <PivotItem itemKey="background" headerText="by Class" />
          <PivotItem itemKey="god" headerText="by God" />
        </Pivot>
      </Flex>
    </ContentContainer>
  </Container>
))
