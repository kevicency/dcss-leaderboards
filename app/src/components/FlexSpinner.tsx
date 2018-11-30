import { CommonProps, Flex, FlexProps } from '@rebass/grid'
import { ISpinnerProps, Spinner, SpinnerSize } from 'office-ui-fabric-react'
import * as React from 'react'

export { SpinnerSize, ISpinnerProps as SpinnerProps }

export const FlexSpinner = ({
  spinnerProps,
  ...props
}: FlexProps & CommonProps & { spinnerProps?: ISpinnerProps }) => (
  <Flex
    align="center"
    justify="center"
    flexDirection="column"
    flex="1"
    justifyContent="center"
    {...props as any}>
    <Spinner size={SpinnerSize.large} {...spinnerProps} />
  </Flex>
)

export default FlexSpinner
