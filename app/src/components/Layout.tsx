import styled, { Flex } from '../styled'

export const ContentContainer = styled(Flex)`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
`
export const OverflowContentContainer = styled(ContentContainer)`
  overflow-x: auto;
`

export const LightBackgroundContainer = styled.div`
  background: ${({ theme }) => theme.palette.neutralLighterAlt};
`
