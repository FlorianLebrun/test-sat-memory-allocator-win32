import React, { Component } from "react"
import { ProfileView, ProfileViewLink } from "./ProfileView"
import { HtmlGrabReaction } from "./charts/event.utils"

type PropsType = {
  range: ProfileView,
  selection: ProfileView,
  children: any,
}

class ProfileViewSelector extends Component<void, PropsType, Object> {
  props: Object
  state = {
    min: 0,
    max: 1,
  }
  viewClient: ProfileViewClient

  componentWillMount() {
    const { selection } = this.props
    this.viewClient = new ProfileViewLink(selection, this.updateRange)
    this.viewClient.update = this.updateRange
  }
  componentWillUnmount() {
    this.viewClient.unmap()
  }
  handleMouseDown = (e: SyntheticEvent) => {
    this.drag = new HtmlGrabReaction(e.currentTarget, e, this.handleOffset, this.handleRelease)
  }
  handleOffset = (e: HtmlGrabReaction) => {
    const rect = e.selection()
    const width = e.element.clientWidth
    const min = rect.left / width
    const max = rect.right / width
    this.setState({ min, max })
  }
  handleRelease = (e: HtmlGrabReaction) => {
    const { range, selection } = this.props
    const { min, max } = this.state
    const interval = range.end - range.start
    selection.set(range.start + min * interval, range.start + max * interval)
  }
  updateRange = () => {
    const { range, selection } = this.props
    const interval = range.end - range.start
    const min = (selection.start - range.min) / interval
    const max = (selection.end - range.min) / interval
    this.setState({ min, max })
  }
  render() {
    const { children } = this.props
    const { min, max } = this.state
    return (<div
      style={{
        position: "relative",
      }}
    >
      {children}

      <div
        onMouseDown={this.handleMouseDown}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            backgroundColor: "rgba(0,0,0,0.2)",
            left: 0,
            top: 0,
            width: (min * 100) + "%",
            height: "100%",
            borderRight: "1px solid #666",
          }}
        />
        <div
          style={{
            position: "absolute",
            backgroundColor: "rgba(0,0,0,0.2)",
            right: 0,
            top: 0,
            width: ((1 - max) * 100) + "%",
            height: "100%",
            borderLeft: "1px solid #666",
          }}
        />
      </div>
    </div>)
  }
}

export default ProfileViewSelector