import React from 'react'

export type WelcomeDialogProps = {
  message: string
}

export class WelcomeDialog extends React.Component<WelcomeDialogProps> {
  render() {
    const { message } = this.props
    return <button>{message}</button>
  }
}
