import React from "react"
import TreeNode from "./TreeNode"

class DataValue extends React.Component {
  props: any
  data: any

  renderObject = () => {
    const { value, inspector } = this.props
    return value && Object.keys(value).map((name, i) => {
      return <DataValue name={name} value={value[name]} inspector={inspector} />
    })
  }
  renderData = () => {
    const { value, inspector } = this.props

    // Fetch content when needed
    const { $ref } = value
    if (!this.data) {
      if (value.data) {
        this.data = value.data
      }
      else {
        return inspector.fetchData(value, {
          body: { $ref }
        }).then((res) => {
          this.data = res.json.data || { $error: "Bad response" }
          return this.data
        }).catch((e) => {
          this.data = { $error: e.message || e.status }
          return this.data
        })
      }
    }
    else if (this.data instanceof Promise) {
      return this.data
    }

    // Render content
    const { data } = this
    return data && Object.keys(data).map((name, i) => {
      return <DataValue name={name} value={data[name]} inspector={inspector} />
    })
  }
  render() {
    const { name, value } = this.props
    if (!(value instanceof Object)) {
      return <TreeNode
        header={<span><b className="text-magenta">{name}</b> = {JSON.stringify(value)}</span>}
        content={null}
      />
    }
    else if (value.$ref) {
      return <TreeNode
        header={<span><b className="text-magenta">{name}</b><i className="text-shade"> : {value.extends || "object"}</i></span>}
        content={this.renderData}
      />
    }
    else {
      return <TreeNode
        header={<span><b className="text-magenta">{name}</b><i className="text-shade"> : object</i></span>}
        content={this.renderObject}
      />
    }
  }
}


class DataFrame extends React.Component {
  props: any

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
        return <DataValue name={name} value={data[name]} inspector={inspector} />
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
    return React.createElement(TreeNode, this.renderHeader() as any)
  }
}

export default DataFrame