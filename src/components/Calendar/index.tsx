import React from 'react'
import {withStyles} from '@material-ui/core/styles'
import {WithStyles} from '@material-ui/core'
import Input from '@material-ui/core/Input'

const styles = () => ({})

interface Props extends WithStyles<typeof styles> {

}

const InputDate = (props:Props) => {
  return <Input/>
}

export default withStyles(styles)(InputDate)

