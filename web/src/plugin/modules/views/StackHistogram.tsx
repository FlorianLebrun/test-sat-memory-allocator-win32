import React from "react"
import { NestedFlameChart } from "../charts/chart-flame"
import { ProfileViewListener } from "../ProfileView"


class StackHistogramView extends React.Component {
  props: any
  state = {
    histogram: null,
  }
  viewClient: ProfileViewListener
  pending = null
  start = 0
  end = 0

  componentWillMount() {
    const { view } = this.props
    this.viewClient = new ProfileViewListener(view, this.updateRange)
    this.updateRange()
  }
  componentWillUnmount() {
    this.viewClient.unmap()
  }
  updateRange = () => {
    const { inspector } = this.props
    const { start, end } = this.viewClient.view
    if (!this.pending && (this.start !== start || this.end !== end)) {
      this.start = start
      this.end = end
      this.pending = inspector.fetchAPI("/inspector/sat/tick-histogram", {
        body: { start, end }
      }).then((data) => {
        this.pending = null
        this.setState({ histogram: data.json })
        this.updateRange()
      }, () => {
        this.pending = null
        this.setState({ histogram: null })
        this.updateRange()
      })
    }
  }
  render() {
    const { className, style } = this.props
    const { histogram } = this.state
    if (histogram) {
      return (<React.Fragment>
        <small className="text-shade">{"hits: " + histogram.hits}</small>
        <NestedFlameChart histogram={histogram} className={className} style={style} />
      </React.Fragment>)
    }
    return null
  }
}

export default StackHistogramView