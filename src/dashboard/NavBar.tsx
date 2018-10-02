import React from 'react'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Card from './Card'
import CardContent from './CardContent'

type NavBarEntry = {
  description: string
  onClick: () => void
}

export type NavBarProps = {
  entries: NavBarEntry[]
}

export default class NavBar extends React.Component<NavBarProps> {
  render() {
    const { entries } = this.props
    const elements = entries.map(({ description, onClick }) => (
      <div>
        <ListItem button onClick={onClick}>
          <ListItemText>{description}</ListItemText>
        </ListItem>
      </div>
    ))
    return (
      <Card style={{ minWidth: '280px' }}>
        <CardContent style={{ padding: '24px 0 24px' }}>
          <List>{elements}</List>
        </CardContent>
      </Card>
    )
  }
}
