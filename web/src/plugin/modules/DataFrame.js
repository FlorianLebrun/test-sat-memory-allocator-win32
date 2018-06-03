import React, { Component } from "react"
import TreeNode from "@modules/TreeNode"

class DataFrame extends Component<void, Object, void> {
  props: Object

  renderHeader() {
    const { value, name } = this.props
    const title = name + ": " + value.extends
    switch (value.type) {
      case "object":
        return {
          header: (<span title={title}><b className="text-magenta">{name}</b><i className="text-shade">: {value.extends}</i></span>),
          content: this.renderContent(),
        }
      default:
        return {
          header: (<span title={title}><b className="text-magenta">{name}</b>: {JSON.stringify(value.data)}</span>),
          content: value.stack && this.renderContent(),
        }
    }
  }
  renderStack = () => {
    const { value } = this.props
    return (<div className="flex-col padding-right">
      {value.stack.map((x, i) => <small key={i} className="margin-left font-bold text-purple">
        <span className="fa fa-angle-right padding-right" />
        {x}
      </small>)}
    </div>)
  }
  renderContent = () => {
    const { value, inspector } = this.props
    const { data } = value
    let content
    if (value.type === "object") {
      content = data && Object.keys(data).map((name, i) => {
        return <DataFrame name={name} value={data[name]} inspector={inspector} />
      })
    }
    return <React.Fragment>
      {content}
      {value.stack &&
        <TreeNode
          header={<i><span className="fa fa-stack-overflow padding-right" />stack</i>}
          content={this.renderStack}
        />
      }
    </React.Fragment>
  }
  render() {
    return React.createElement(TreeNode, this.renderHeader())
  }
}

export default DataFrame