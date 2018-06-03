import React, { Component } from "react"
import { NestedFlameChart } from "./charts/chart-flame"
import { ScalarLink } from "../ProfileView"

class StackHistogramView extends Component {
  props: Object
  state: Object = {
    histogram: null,
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
      inspector.fetchAPI("/inspector/sat/tick-histogram", {
        body: { start, end }
      }).then((data) => {
        this.setState({ histogram: data.json })
      }).catch(() => {
        this.setState({ histogram: null })
      })
    }
  }
  render() {
    const { className, style } = this.props
    const { histogram } = this.state
    return (<NestedFlameChart histogram={histogram} className={className} style={style} />)
  }
}

export default StackHistogramView