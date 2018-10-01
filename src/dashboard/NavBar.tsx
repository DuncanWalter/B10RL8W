import React from 'react'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'

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
      <div>
        <ListItem button onClick={onClick}>
          <ListItemText>{description}</ListItemText>
        </ListItem>
        <Divider />
      </div>
    ))
    return (
      <Drawer variant="permanent" anchor="left">
        <List>{elements}</List>
      </Drawer>
    )
  }
}
