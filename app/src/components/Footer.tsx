import { Icon } from 'office-ui-fabric-react'
import * as React from 'react'
import { uri as graphqlUri } from '../apollo'
import { GithubLogo } from '../assets/github'
import { GraphQLLogo } from '../assets/graphql'
import stonesoup from '../assets/stonesoup.png'
import styled, { Box, Flex } from '../styled'
import t from '../theme'
import { ContentContainer } from './Layout'

const Container = styled(Box)`
  background: ${({ theme }) => theme.palette.neutralTertiary};
  color: ${({ theme }) => theme.palette.white};

  i {
    margin: 0 3px;
    vertical-align: middle;
  }
`
const Link = styled.a`
  &,
  &:hover,
  &:visited {
    color: white;
  }
`
export const Footer = () => (
  <Container>
    <ContentContainer
      justifyContent="space-between"
      alignItems="center"
      py={3}
      px={2}>
      <Box>
        <Icon iconName="CodeEdit" styles={{ root: { fontSize: 20 } }} /> with
        <Icon
          iconName="HeartFill"
          styles={{ root: { fontSize: 16, color: t.palette.magentaLight } }}
        />{' '}
        by MeekVeins
      </Box>
      <Flex alignItems="center">
        <Box mx={1}>
          <Link href="https://github.com/kmees/speedcrawl" target="_blank">
            <GithubLogo height="22px" width="22px" />
          </Link>
        </Box>
        <Box mx={1}>
          <Link href={graphqlUri} target="_blank">
            <GraphQLLogo height="22px" width="22px" />
          </Link>
        </Box>
        <Box mx={1}>
          <Link href="https://crawl.develz.org/" target="_blank">
            <img src={stonesoup} height="24" />
          </Link>
        </Box>
      </Flex>
    </ContentContainer>
  </Container>
)
