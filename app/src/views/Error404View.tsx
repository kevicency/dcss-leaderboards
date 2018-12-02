import * as React from 'react'
import { ContentContainer } from '../components'
import { Box } from '../styled'

export const Error404View = () => (
  <ContentContainer flex="1">
    <Box py={4} flex="1">
      This is not the page you're looking for!
    </Box>
  </ContentContainer>
)
