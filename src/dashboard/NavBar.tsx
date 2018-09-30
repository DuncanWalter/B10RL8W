import React from 'react'

type NavBarEntry = {
  description: string
  onClick: () => void
}
export type NavBarProps = {
  entries: NavBarEntry[]
}

export class NavBar extends React.Component<NavBarProps> {
  render() {
    const { entries } = this.props
    const elements = entries.map(({ description, onClick }) => (
      <li>
        <button onClick={onClick}>{description}</button>
      </li>
    ))
    return <ol>{elements}</ol>
  }
}
