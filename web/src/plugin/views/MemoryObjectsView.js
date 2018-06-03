import React, { Component } from "react"
import { ScalarLink } from "../ProfileView"

class ObjectsView extends Component {
  props: Object
  state: Object = {
    objects: null
  }
  viewClient: ProfileViewClient
  start = 0
  end = 0

  componentWillMount() {
    const { view } = this.props
    this.viewClient = new ScalarLink(view, this.updateRange)
    this.viewClient.update = this.updateRange
  }
  componentWillUnmount() {
    this.viewClient.unmap()
  }
  updateRange = () => {
    const { inspector } = this.props
    const { start, end } = this.viewClient.view
    if (this.start !== start || this.end !== end) {
      this.start = start
      this.end = end
      inspector.fetchAPI("/inspector/sat/memory-objects", {
        body: { start, end }
      }).then((res) => {
        const data = res.json
        this.setState({ objects: data.objects })
      })
    }
  }
  render() {
    const { className, style } = this.props
    const { objects } = this.state
    return (<div className={className} style={style}>
      {objects && objects.map((x, i) => {
        return (<div key={i}>{x.at}</div>)
      })}
    </div>)
  }
}

export default ObjectsView