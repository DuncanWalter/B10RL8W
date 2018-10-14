import * as React from 'react'
import { Typography } from '@material-ui/core'

const buttonStyles = {
  marginLeft: '24px',
  padding: '8px 16px 8px',
  cursor: 'pointer',
  color: 'rgba(255, 255, 255, 0.96)',
  display: 'inline-block',
  borderRadius: '4px',
  transition: '0.2s',
}

const buttonMixins = {
  primary: {
    hovered: {
      backgroundColor: 'rgba(85, 119, 204, 0.8)',
    },
    normal: {
      backgroundColor: '#5577cc',
    },
  },
  danger: {
    hovered: {
      backgroundColor: 'rgba(251, 81, 132, 0.8)',
    },
    normal: {
      backgroundColor: '#fb5184',
    },
  },
  disabled: {
    cursor: 'not-allowed',
    color: 'rgba(64, 64, 64, 0.96)',
    backgroundColor: '#aaaaad',
  },
}

export default class Button extends React.Component<
  {
    text?: string
    onClick?: () => unknown
    disabled?: boolean
    variant?: 'primary' | 'danger'
  },
  { hovered: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hovered: false }
  }
  render() {
    const { text, onClick, disabled = false, variant = 'primary' } = this.props
    const { hovered } = this.state
    const mixin = disabled
      ? buttonMixins.disabled
      : buttonMixins[variant][hovered ? 'hovered' : 'normal']
    const style = {
      ...buttonStyles,
      ...mixin,
    }

    return (
      <div
        style={style}
        onClick={disabled ? () => {} : onClick}
        onMouseEnter={() => {
          if (!disabled) {
            this.setState({ hovered: true })
          }
        }}
        onMouseLeave={() => {
          this.setState({ hovered: false })
        }}
      >
        <Typography variant="button" color="inherit">
          {text}
        </Typography>
      </div>
    )
  }
}
