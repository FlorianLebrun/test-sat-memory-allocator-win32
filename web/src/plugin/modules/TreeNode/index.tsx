import React from "react"

export type PropsType = {
  open?: boolean,
  noMargin?: boolean,
  largeOpen?: boolean | "full",
  parameters?: any,
  header?: any,
  content?: any | Function, // content: at Function.invoke(parameters) is Promise
}

export type StateType = {
  open: boolean,
}

export default class TreeNode extends React.Component {
  props: PropsType
  state: StateType

  componentWillMount() {
    this.setState({ open: this.props.open ? true : false })
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps || nextState
  }
  handleOpen = () => {
    this.setState({ open: !this.state.open })
  }
  handleUpdate = () => {
    this.forceUpdate()
  }
  render() {
    const { open } = this.state
    const { parameters, largeOpen, noMargin } = this.props
    let { header, content } = this.props

    // Render content and related icon
    let icon
    let isLoading = false
    const hasIcon = largeOpen !== "full"
    if (open) {
      if (content instanceof Function) {
        content = content(parameters, this.handleOpen)
      }
      if (content instanceof Promise) {
        icon = hasIcon && (<span className="fa fa-fw fa-spinner fa-pulse" />)
        content.then(this.handleUpdate)
        content = null
        isLoading = true
      }
      else if (content) {
        icon = hasIcon && (<span className="fa fa-fw fa-caret-down cursor-pointer" onClick={this.handleOpen} />)
      }
      else {
        icon = hasIcon && (<span className="fa fa-fw fa-circle-o" style={styles.tiny} />)
      }
    }
    else if (content) {
      icon = hasIcon && (<span className="fa fa-fw fa-caret-right cursor-pointer" onClick={this.handleOpen} />)
      content = null
    }
    else {
      icon = hasIcon && (<span className="fa fa-fw fa-circle-o" style={styles.tiny} />)
    }

    // Render header
    if (header instanceof Function) {
      const status = open ? (isLoading ? "loading" : "open") : "close"
      header = header(status, parameters, this.handleOpen)
    }
    if (largeOpen) {
      header = (<div className="flex-1 cursor-pointer" onClick={this.handleOpen}>{header}</div>)
    }
    else {
      header = (<div className="flex-1">{header}</div>)
    }

    return (
      <div>
        <div className="flex-row center">
          <span className="flex-no">{icon}</span>
          {header}
        </div>
        {content && (<div className={!noMargin ? "margin-left-lg" : undefined}>{content}</div>)}
      </div>
    )
  }
}

const styles = {
  tiny: {
    fontSize: 8,
    width: "2.6em",
    verticalAlign: "middle",
  },
}
