import { MessageBar, MessageBarType } from 'office-ui-fabric-react'
import * as React from 'react'
import { Bold } from '../components'

export const ErrorMessage = ({
  message,
  error,
}: {
  message?: string
  error?: any
}) => (
  <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
    {message && <Bold>{message}</Bold>}
    {error && <div>Error: {error.stack || error.message || error}</div>}
  </MessageBar>
)
