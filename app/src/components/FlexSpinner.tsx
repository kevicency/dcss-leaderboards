import { CommonProps, Flex, FlexProps } from '@rebass/grid'
import { Spinner, SpinnerSize } from 'office-ui-fabric-react'
import * as React from 'react'

export type FlexSpinnerProps = CommonProps &
  FlexProps & {
    label?: string
  }
export const FlexSpinner = ({ label, ...props }: FlexSpinnerProps) => (
  <Flex
    align="center"
    justify="center"
    flexDirection="column"
    flex="1"
    justifyContent="center"
    {...props as any}>
    <Spinner size={SpinnerSize.large} label={label} />
  </Flex>
)

export default FlexSpinner
